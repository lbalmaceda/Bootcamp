var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
var cw = new AWS.CloudWatch({apiVersion: '2010-08-01'});
const {promisify} = require('util');
const logger = require('../lib/log/logger.js');

const publishMetric = (queueSize) => {
  const params = {
    MetricData: [
      {
        MetricName: 'QUEUE_SIZE',
        Unit: 'None',
        Value: queueSize
      },
    ],
    Namespace: 'WORKER'
  };
  
  const putMetricData = promisify(cw.putMetricData);
  return putMetricData(params)
    .then(() => logger.info("Queue size metric updated"))
    .catch((err) => logger.error("Failed to update Queue size metric", err));
}

module.exports = publishMetric;