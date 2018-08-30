const path = require('path');
const logger = require('winston');
const db = require('../../../../models');

const { details, publishing: { disabled, disabledMessage, thumbnailChannel, thumbnailChannelId, primaryClaimAddress } } = require('@config/siteConfig');
const { resolveUri } = require('../../../../lbrynet');

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
      return db.Claim.findOne({
        where: {
          name,
          channelName,
        },
      });
    })
    .then(claim => {
      claimRecord = claim;
      return resolveUri(`${claim.name}#${claim.claimId}`);
    })
    .then(fullClaim => {
      logger.info('fullClaim', fullClaim);
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
        fileName = fullClaim.file_name;
        fileType = fullClaim.mime_type;
        publishParams['sources'] = fullClaim.claim.value.stream.source;
      }
      return publish(publishParams, fileName, fileType);
    })
    .then(result => {
      res.status(200).json({
        success: true,
        message: 'update successful',
        data   : {
          name    : result.name,
          claimId : result.claim_id,
          url     : `${details.host}/${result.claim_id}/${name}`, // for backwards compatability with app
          showUrl : `${details.host}/${result.claim_id}/${name}`,
          // serveUrl: `${details.host}/${result.claim_id}/${name}${fileE}`,
          lbryTx  : result,
        },
      });
      // record the publish end time and send to google analytics
      sendGATimingEvent('end-to-end', 'update', fileType, gaStartTime, Date.now());
    })
    .catch(error => {
      logger.info("update/index.js fail");
      handleErrorResponse(originalUrl, ip, error, res);
    });
};

module.exports = claimUpdate;
