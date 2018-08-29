const logger = require('winston');

const handleLbrynetResponse = ({ data }, resolve, reject) => {
  logger.info('lbry api data:', data);
  if (data.result) {
    // check for an error
    if (data.result.error) {
      logger.info('Lbrynet api error:', data.result.error);
      reject(new Error(data.result.error));
      return;
    };
    resolve(data.result);
    return;
  }
  // fallback in case it just timed out
  reject(JSON.stringify(data));
};

module.exports = handleLbrynetResponse;
