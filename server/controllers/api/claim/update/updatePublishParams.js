const logger = require('winston');
const { details, publishing } = require('@config/siteConfig');
const validateFileTypeAndSize = require('../publish/validateFileTypeAndSize.js');
const db = require('../../../../models');

const updatePublishParams = (claim, body, {file, thumbnail}) => {
  return new Promise((resolve, reject) => {
    let publishParams = {
      name         : claim.name,
      title        : claim.title,
      description  : claim.description,
      nsfw         : claim.nsfw,
      license      : claim.license,
      channel_name : body.channelName,
      channel_id   : body.channelId,
      author       : details.title,
      language     : 'en',
      claim_address: publishing.primaryClaimAddress,
      bid          : 0.01,
    };

    if (body.title) {
      publishParams['title'] = body.title;
    }

    if (body.description) {
      publishParams['description'] = body.description;
    }

    if (body.nsfw) {
      publishParams['nsfw'] = body.nsfw;
    }

    if (body.license) {
      publishParams['license'] = body.license;
    }

    if (thumbnail) {
      publishParams['thumbnail'] = thumbnail;
    }

    if (file) {
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
      validateFileTypeAndSize(file);
      publishParams['file_path'] = file.path;
      logger.info('update PublishParams w/new file:', publishParams);
      resolve({publishParams, file});
    } else {
      // publishParams['file_path'] = 'this for now';
      db.File.findOne({
        where: {
          name: claim.name,
        },
      })
        .then(file => {
          publishParams['file_path'] = file.filePath;
          logger.info('update PublishParams w/old file:', publishParams);
          resolve({publishParams, file});
        })
        .catch(error => reject(error));
    }
  });
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

const parseUpdateThumbnail = ({thumbnail}) => {
  if (!thumbnail) {
    return false;
  }
  return {
    thumbnailFileName: thumbnail.name,
    thumbnailFilePath: thumbnail.path,
    thumbnailFileType: thumbnail.type,
  };
};

module.exports = [
  // parsePublishApiRequestFiles,
  parseUpdateFile,
  parseUpdateThumbnail,
];
