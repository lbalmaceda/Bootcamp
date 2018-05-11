var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
var cw = new AWS.CloudWatch({apiVersion: '2010-08-01'});
const logger = require('../lib/log/logger.js');

const publishMetric = (queueSize) => {
  const params = {
    MetricData: [
      {
        MetricName: 'NICOLUCHO_QUEUE_SIZE',
        Unit: 'None',
        Value: queueSize
      },
    ],
    Namespace: 'WORKER'
  };
  
  return cw.putMetricData(params).promise()
    .then(() => logger.info("Queue size metric updated"))
    .catch(console.error);
}

module.exports = {publishMetric};
