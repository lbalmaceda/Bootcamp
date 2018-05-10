require('dotenv').config();
const { promisify } = require('util');
const bookmarks = require('../lib/db/bookmarks.js');
const logger = require('../lib/log/logger');
const config = require('../config');
const amqp = require('amqplib');

const queueName = config.rabbit.queueName;
const rabbitURL = config.rabbit.url;

const main = async (queueName, rabbitURL) => {
  try {
    logger.info('Connecting to rabbit...');
    const conn = await amqp.connect(rabbitURL);
    logger.info('Rabbit connected!');

    logger.info('Creating channel...');
    const ch = await conn.createChannel();
    logger.info('Channel created!');

    logger.info(`Checking queue ${queueName}...`);
    await ch.assertQueue(queueName);
    logger.info('Queue is ok!');

    const sendItem = buildSendItem(ch, queueName);
    const getQueueSize = buildGetQueueSize(ch, queueName);
    const sendQueueSizeMetric = buildSendQueueSizeMetric();

    await updateQueue(sendItem, getQueueSize, sendQueueSizeMetric);

    ch.close();

    conn.close();
  } catch (e) {
    logger.error(e)
  }
};

main(queueName, rabbitURL)
  .then(() => process.exit(0));

const updateQueue = async (sendItem, getQueueSize, sendQueueSizeMetric) => {
  logger.info('About to query bookmarks');
  const items = await queryBookmarks();
  logger.info('Bookmarks retrieved!');

  logger.info('Sending items...');
  const promises = items.map((item) => Promise.resolve(sendItem(queueName, item)));

  await Promise.all(promises);

  logger.info(`All ${items.length} items sent!`);

  logger.info('Reading queue size...');
  const queueSize = await getQueueSize();
  logger.info(`Read queue size of ${queueSize} messages!`);

  logger.info(`Sending metric with value ${queueSize}`);
  await sendQueueSizeMetric(queueSize);
};

const queryBookmarks = async () => {
  const findAll = promisify(bookmarks.findAll);

  return findAll();
};

const itemToBuffer = (item) => new Buffer(JSON.stringify(item));

const buildSendItem = (ch, queueName) => {
  return async (item) => {
    const itemString = JSON.stringify(item, null, 2);

    logger.info(`Sending item:\n${itemString}`);

    return ch.sendToQueue(queueName, itemToBuffer(item), { persistent: true })
  }
};

const buildGetQueueSize = (ch, queueName) => {
  return async () => {
    const info = await ch.assertQueue(queueName);

    return info.messageCount;
  }
};

const buildSendQueueSizeMetric = () => {
  return async (metric) => {
    return Promise.resolve();
  }
};
