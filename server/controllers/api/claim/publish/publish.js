const logger = require('winston');
const db = require('../../../../models');
const { publishClaim } = require('../../../../lbrynet');
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

  try {
    publishResults = await publishClaim(publishParams);
    logger.info(`Successfully published ${publishParams.name} ${fileName}`, publishResults);

    // get the channel information
    if (publishParams.channel_name) {
      logger.debug(`this claim was published in channel: ${publishParams.channel_name}`);
      channel = await db.Channel.findOne({
        where: {
          channelName: publishParams.channel_name,
        },
      });
    } else {
      logger.debug('this claim was not published in a channel');
      channel = null;
    }
    certificateId = channel ? channel.channelClaimId : null;
    channelName = channel ? channel.channelName : null;
    logger.debug(`certificateId: ${certificateId}`);

    const upsertCriteria = {name: publishParams.name, claimId: publishParams.claim_id};

    [fileRecord, claimRecord] = await Promise.all([
      newFile ? createFileRecordDataAfterPublish(fileName, fileType, publishParams, publishResults) : db.File.findOne({where: {claimId}}),
      createClaimRecordDataAfterPublish(certificateId, channelName, fileName, fileType, publishParams, publishResults),
    ]);

    [file, claim] = await Promise.all([
      db.upsert(db.File, fileRecord, upsertCriteria, 'File'),
      db.upsert(db.Claim, claimRecord, upsertCriteria, 'Claim'),
    ]);
    logger.debug('File and Claim records successfully created');

    await Promise.all([
      file.setClaim(claim),
      claim.setFile(file),
    ]);
    logger.debug('File and Claim records successfully associated');

    return publishResults;
  } catch (err) {
    logger.error('PUBLISH ERROR', err);
    await deleteFile(filePath);
    return err;
  }

};

module.exports = publish;
