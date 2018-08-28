const path = require('path');
const logger = require('winston');
const db = require('../../../../models');

const { details: { host }, publishing: { disabled, disabledMessage, thumbnailChannel, thumbnailChannelId } } = require('@config/siteConfig');

const { sendGATimingEvent } = require('../../../../utils/googleAnalytics.js');

const { handleErrorResponse } = require('../../../utils/errorHandlers.js');

const publish = require('../publish/publish.js');
const createThumbnailPublishParams = require('../publish/createThumbnailPublishParams.js');
// const parsePublishApiRequestFiles = require('../publish/parsePublishApiRequestFiles.js');
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

const parseUpdateFile = ({file}) => {
  // make sure a file was provided
  if (!file) {
    return false;
  }
  if (!file.path) {
    throw new Error('no file path found');
  }
  if (!file.type) {
    throw new Error('no file type found');
  }
  if (!file.size) {
    throw new Error('no file size found');
  }
  // validate the file name
  if (!file.name) {
    throw new Error('no file name found');
  }
  if (file.name.indexOf('.') < 0) {
    throw new Error('no file extension found in file name');
  }
  if (file.name.indexOf('.') === 0) {
    throw new Error('file name cannot start with "."');
  }
  if (/'/.test(file.name)) {
    throw new Error('apostrophes are not allowed in the file name');
  }
  // validate the file
  validateFileTypeAndSize(file);
  // return results
  return {
    fileName         : file.name,
    filePath         : file.path,
    fileExtension    : path.extname(file.path),
    fileType         : file.type,
    // thumbnailFileName: (thumbnail ? thumbnail.name : null),
    // thumbnailFilePath: (thumbnail ? thumbnail.path : null),
    // thumbnailFileType: (thumbnail ? thumbnail.type : null),
  };
};

const parseUpdateThumbnail = ({thumbnail}, claimName, license, nsfw) => {
  if (!thumbnail) {
    return false;
  }
  return createThumbnailPublishParams(thumbnail.path, claimName, license, nsfw);
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
  let channelName,
    channelId,
    channelPassword,
    gaStartTime,
    fileType,
    name,
    nsfw,
    license,
    title,
    description,
    publishParams;
  // record the start time of the request
  gaStartTime = Date.now();

  try {
    ({channelName, channelId, channelPassword} = body);
  } catch (error) {
    return res.status(400).json({success: false, message: error.message});
  }

  // check channel authorization
  authenticateUser(channelName, channelId, channelPassword, user)
    // .then(() => {
    //   return db.Claim.findOne({
    //     where: {
    //       name: body.name,
    //       channelName,
    //     },
    //   });
    // })
    // .then(claim => {
    //   return updatePublishParams(claim, body, files);
    // })
    .then(({ channelName, channelClaimId }) => {
      ({name, nsfw, license, title, description} = body);
      return Promise.all([
        db.Claim.findOne({ where: { name, channelName } }),
        updateMetadata({nsfw, license, title, description}),
        db.File.findOne({ where: { name } }),
        parseUpdateFile(files),
        parseUpdateThumbnail(files, name, license, nsfw),
      ]);
    })
    .then(([existingClaim, metadataUpdate, existingFile, newFile, newThumbnail]) => {
      const {name, nsfw, license, title, description, thumbnail} = existingClaim;
      publishParams = Object.assign(
        {},
        {name, nsfw, license, title, description, thumbnail},
        metadataUpdate
      );
      if (newThumbnail) {
        publishParams['thumbnail'] = `${host}/${thumbnailChannel}:${thumbnailChannelId}/${name}-thumb`;
      }
    // })
    // // .then(({publishParams, file}) => {
    // //   fileType = file.type;
    // //   logger.info('update/index.js 70 file keys:', Object.keys(file).reduce((acc, val) => acc.concat([val]), []));
    // //   return publish(publishParams, file.name, fileType);
    // // })
    // .then(result => {
    //   res.status(200).json({
    //     success: true,
    //     message: 'you did a publish update',
    //     result,
    //   });

      // record the publish end time and send to google analytics
      sendGATimingEvent('end-to-end', 'update', fileType, gaStartTime, Date.now());
    })
    .catch(error => {
      handleErrorResponse(originalUrl, ip, error, res);
    });
};

module.exports = claimUpdate;
