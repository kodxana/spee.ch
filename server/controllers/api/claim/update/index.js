const path = require('path');
const logger = require('winston');
const db = require('../../../../models');

const { details, publishing: { disabled, disabledMessage, thumbnailChannel, thumbnailChannelId, primaryClaimAddress } } = require('@config/siteConfig');
const { getClaim } = require('../../../../lbrynet');

const { sendGATimingEvent } = require('../../../../utils/googleAnalytics.js');

const { handleErrorResponse } = require('../../../utils/errorHandlers.js');

const publish = require('../publish/publish.js');
const createThumbnailPublishParams = require('../publish/createThumbnailPublishParams.js');
const parsePublishApiRequestBody = require('../publish/parsePublishApiRequestBody');
const {parsePublishApiRequestFile, parsePublishApiRequestThumbnail} = require('../publish/parsePublishApiRequestFiles.js');
const authenticateUser = require('../publish/authentication.js');
// const {parseUpdateFile, parseUpdateThumbnail} = require('./updatePublishParams');
const validateFileTypeAndSize = require('../publish/validateFileTypeAndSize');
/*

  route to publish a claim through the daemon

*/

const updateMetadata = ({nsfw, license, title, description}) => {
  const update = {};
  if (nsfw) update['nsfw'] = nsfw;
  if (license) update['license'] = license;
  if (title) update['title'] = title;
  if (description) update['description'] = description;
  return update;
};


const claimUpdate = ({ body, files, headers, ip, originalUrl, user, tor }, res) => {
  // logging
  logger.info('Claim update request:', {
    ip,
    headers,
    body,
    files,
    user,
  });

  // check for disabled publishing
  if (disabled) {
    return res.status(503).json({
      success: false,
      message: disabledMessage,
    });
  }

  // define variables
  let  channelName, channelId, channelPassword, description, fileName, filePath, fileExtension, fileType, gaStartTime, license, name, nsfw, thumbnail, thumbnailFileName, thumbnailFilePath, thumbnailFileType, title, publishParams, thumbnailParams, claimRecord;
  // record the start time of the request
  gaStartTime = Date.now();

  try {
    ({name, nsfw, license, title, description, thumbnail} = parsePublishApiRequestBody(body));
    if (files.file) {
      ({fileName, filePath, fileExtension, fileType} = parsePublishApiRequestFile(files));
      if (files.thumbnail) {
        ({thumbnailFileName, thumbnailFilePath, thumbnailFileType} = parsePublishApiRequestThumbnail(files));
      }
    }
    ({channelName, channelId, channelPassword} = body);
  } catch (error) {
    return res.status(400).json({success: false, message: error.message});
  }

  // check channel authorization
  authenticateUser(channelName, channelId, channelPassword, user)
    .then(({ channelName, channelClaimId }) => {
      logger.info('auth good', channelName);
      // const {name, nsfw, license, title, description} = body;
      // return Promise.all([
      //   db.Claim.findOne({ where: { name, channelName } }),
      //   updateMetadata({nsfw, license, title, description}),
      //   db.File.findOne({ where: { name } }),
      //   // parseUpdateFile(files),
      //   // parseUpdateThumbnail(files, name, license, nsfw),
      // ]);
      return db.Claim.findOne({where: {name, channelName,},});
    })
    .then(claim => {
      claimRecord = claim;
      return getClaim(`${claim.name}#${claim.claimId}`);
    })
    .then(fullClaim => {
      const metadata = Object.assign({}, {
        title      : claimRecord.title,
        description: claimRecord.description,
        nsfw       : claimRecord.nsfw,
        license    : claimRecord.license,
        language   : 'en',
        author     : details.title,
      }, updateMetadata({title, description, nsfw, license}));
      const publishParams = {
        name,
        bid          : 0.01,
        claim_address: primaryClaimAddress,
        channel_name : channelName,
        channel_id   : channelId,
        metadata,
      };
      if (files.file) {
        publishParams['file_path'] = filePath;
      } else {
        publishParams['sources'] = {'lbry_sd_hash': fullClaim.stream_hash};
      }
      return publish(publishParams, fileName, fileType);
    })
    // .then(([existingClaim, metadataUpdate, existingFile, /*newFile, newThumbnail*/]) => {
    //   logger.info("multi-promise good");
    //   if (existingClaim) {
    //     logger.info('existingClaim', existingClaim);
    //     return getClaim(`${existingClaim.name}#${existingClaim.claimId}`);
    //   }
    //   const metadata = Object.assign({}, {
    //     title      : existingClaim.title,
    //     description: existingClaim.description,
    //     nsfw       : existingClaim.nsfw,
    //     license    : existingClaim.license,
    //     language   : 'en',
    //     author     : details.title,
    //   }, metadataUpdate);
    //   if (existingClaim.contentType === 'video/mp4' && files.thumbnail) {
    //     metadata['thumbnail'] = `${details.host}/${thumbnailChannel}:${thumbnailChannelId}/${name}-thumb`;
    //     thumbnailParams = {
    //       name         : `${name}-thumb`,
    //       file_path    : thumbnailFilePath,
    //       bid          : 0.01,
    //       claim_address: primaryClaimAddress,
    //       channel_name : thumbnailChannel,
    //       channel_id   : thumbnailChannelId,
    //       metadata     : {
    //         title      : `${name} thumbnail`,
    //         description: `a thumbnail for ${name}`,
    //         author     : details.title,
    //         language   : 'en',
    //         license    : metadata.license,
    //         nsfw       : metadata.nsfw,
    //       },
    //     };
    //   }
    //   publishParams = {
    //     name         : existingClaim.name,
    //     bid          : 0.01,
    //     claim_address: primaryClaimAddress,
    //     channel_name : existingClaim.channelName,
    //     channel_id   : existingClaim.certificateId,
    //     metadata,
    //   };
    //   if (existingClaim) {
    //     publishParams['sources'] = {};
    //   }
    //   if (files.file) {
    //     publishParams['file_path'] = filePath;
    //   }
    //   if (thumbnailParams) {
    //     logger.info('doing a thumbnail publish update', thumbnailParams);
    //     publish(thumbnailParams, thumbnailFileName, thumbnailFileType);
    //   }
    //   logger.info('doing a publish update', publishParams);
    //   return publish(publishParams, fileName, fileType);
    // })
    .then(result => {
      res.status(200).json({
        success: true,
        message: 'see below',
        result,
        // data   : {
        //   name    : result.name,
        //   claimId : result.claim_id,
        //   url     : `${details.host}/${result.claim_id}/${name}`, // for backwards compatability with app
        //   showUrl : `${details.host}/${result.claim_id}/${name}`,
        //   // serveUrl: `${details.host}/${result.claim_id}/${name}${fileE}`,
        //   lbryTx  : result,
        // },
      });
      // record the publish end time and send to google analytics
      // sendGATimingEvent('end-to-end', 'update', fileType, gaStartTime, Date.now());
    })
    .catch(error => {
      logger.info("update/index.js fail");
      handleErrorResponse(originalUrl, ip, error, res);
    });
};

module.exports = claimUpdate;
