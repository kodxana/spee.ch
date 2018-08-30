const logger = require('winston');
const { publishClaim } = require('../../../../lbrynet');
const db = require('../../../../models');
const { createFileRecordDataAfterPublish } = require('../../../../models/utils/createFileRecordData.js');
const { createClaimRecordDataAfterPublish } = require('../../../../models/utils/createClaimRecordData.js');
const deleteFile = require('./deleteFile.js');

const publish = async (publishParams, fileName, fileType) => {
  let publishResults,
    certificateId,
    channel,
    channelName,
    filePath = publishParams.file_path,
    newFile = Boolean(filePath),
    fileRecord,
    claimRecord,
    file,
    claim;

  const handleError = async (err) => {
    logger.error('PUBLISH ERROR', err);
    try {
      await deleteFile(filePath);
    } catch(error) {
      logger.error(error);
    }
    return err;
  };

  try {
    publishResults = await publishClaim(publishParams);
    logger.info(`Successfully published ${publishParams.name} ${fileName}`, publishResults);
  }
  catch(error) {
    logger.info('pub failed', publishParams);
    return handleError(error);
  }

  // get the channel information
  if (publishParams.channel_name) {
    logger.debug(`this claim was published in channel: ${publishParams.channel_name}`);
    try {
      channel = await db.Channel.findOne({
        where: {
          channelName: publishParams.channel_name,
        },
      });
    }
    catch(error) {
      return handleError(error);
    }
  } else {
    logger.debug('this claim was not published in a channel');
    channel = null;
  }
  certificateId = channel ? channel.channelClaimId : null;
  channelName = channel ? channel.channelName : null;
  logger.info(`certificateId: ${certificateId}`);

  const {name} = publishParams;
  const {claim_id: claimId} = publishResults;
  const upsertCriteria = {
    name,
    claimId,
  };

  try {
    [ fileRecord, claimRecord ] = await Promise.all([
      newFile ? createFileRecordDataAfterPublish(fileName, fileType, publishParams, publishResults) : db.File.findOne({where: {claimId}}),
      createClaimRecordDataAfterPublish(certificateId, channelName, fileName, fileType, publishParams, publishResults),
    ]);
  }
  catch(error) {
    return handleError(error);
  }

  logger.info('fileRecord', fileRecord);
  logger.info('claimRecord', claimRecord);

  try {
    [ file, claim ] = await Promise.all([
      db.upsert(db.File, fileRecord, upsertCriteria, 'File'),
      db.upsert(db.Claim, claimRecord, upsertCriteria, 'Claim'),
    ]);
    // file = await db.upsert(db.File, fileRecord, upsertCriteria, 'File');
    // claim = await db.upsert(db.Claim, claimRecord, upsertCriteria, 'Claim');
    logger.info(`${newFile ? 'File and ' : ''}Claim records successfully created`);
  }
  catch(error) {
    return handleError(error);
  }

  try {
    file.setClaim(claim);
    claim.setFile(file);
    logger.info('File and Claim records successfully associated');
  }
  catch(error) {
    return handleError(error);
  }

  return publishResults;
};

module.exports = publish;
