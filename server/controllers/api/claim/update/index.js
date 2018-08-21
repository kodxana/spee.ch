const logger = require('winston');
const db = require('../../../../models');

const { details: { host }, publishing: { disabled, disabledMessage } } = require('@config/siteConfig');

const { sendGATimingEvent } = require('../../../../utils/googleAnalytics.js');

const { handleErrorResponse } = require('../../../utils/errorHandlers.js');

const publish = require('../publish/publish.js');
const createPublishParams = require('../publish/createPublishParams.js');
const createThumbnailPublishParams = require('../publish/createThumbnailPublishParams.js');
const parsePublishApiRequestBody = require('../publish/parsePublishApiRequestBody.js');
const parsePublishApiRequestFiles = require('../publish/parsePublishApiRequestFiles.js');
const authenticateUser = require('../publish/authentication.js');

const CLAIM_TAKEN = 'CLAIM_TAKEN';

/*

  route to publish a claim through the daemon

*/

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
  let  channelName, channelId, channelPassword, description, fileName, filePath, fileExtension, fileType, gaStartTime, license, name, nsfw, thumbnail, thumbnailFileName, thumbnailFilePath, thumbnailFileType, title;
  // record the start time of the request
  gaStartTime = Date.now();
  // validate the body and files of the request
  try {
    // validateApiPublishRequest(body, files);
    ({name, nsfw, license, title, description, thumbnail} = parsePublishApiRequestBody(body));
    ({fileName, filePath, fileExtension, fileType, thumbnailFileName, thumbnailFilePath, thumbnailFileType} = parsePublishApiRequestFiles(files));
    ({channelName, channelId, channelPassword} = body);
  } catch (error) {
    return res.status(400).json({success: false, message: error.message});
  }
  // check channel authorization
  // why channelId and channelClaimId
  authenticateUser(channelName, channelId, channelPassword, user)
    .then(() => {
      return Promise.all([
        createPublishParams(filePath, name, title, description, license, nsfw, thumbnail, channelName, channelId),
        createThumbnailPublishParams(thumbnailFilePath, name, license, nsfw),
        db.Claim.findOne({
          where: {
            name,
            channelName,
          },
        }),
      ]);
    })
    .then(([ publishParams, thumbnailPublishParams, claimResult ]) => {
      // publishParams['claim_id'] = claimResult.claimId;
      //
      // res.status(200).json({publishParams, claimResult});

      // publish the thumbnail, if one exists
      if (thumbnailPublishParams) {
        publish(thumbnailPublishParams, thumbnailFileName, thumbnailFileType);
      }

      // publish the asset
      return publish(publishParams, fileName, fileType);
    })
    .then(result => {
      res.status(200).json({
        success: true,
        message: 'publish completed successfully',
        data   : {
          name,
          claimId : result.claim_id,
          url     : `${host}/${result.claim_id}/${name}`, // for backwards compatability with app
          showUrl : `${host}/${result.claim_id}/${name}`,
          serveUrl: `${host}/${result.claim_id}/${name}${fileExtension}`,
          lbryTx  : result,
        },
      });
      // record the publish end time and send to google analytics
      sendGATimingEvent('end-to-end', 'update', fileType, gaStartTime, Date.now());
    })
    .catch(error => {
      if (error.name === CLAIM_TAKEN) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      handleErrorResponse(originalUrl, ip, error, res);
    });
};

module.exports = claimUpdate;
