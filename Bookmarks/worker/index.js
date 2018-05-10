const config = require('../config');
const axios = require("axios");
const amqp = require("amqplib");
const logger = require("../lib/log/logger.js");
const bookmarks = require('../lib/db/bookmarks.js');
const {promisify} = require('util');

const { queueName, url } = config.rabbit;

const main = async (queueName, rabbitURL) => {
  let conn;

  try {
    conn = await amqp.connect(rabbitURL);

    const ch = await conn.createChannel();

    // Check queue exists
    await ch.assertQueue(queueName, { durable: true });

    // Process queue items
    await processQueue(ch, queueName);
  } catch (e) {
    conn.close();
    logger.error("Q Connection closed: " + e);
  }
};

main(queueName, url);

const processQueue = (ch, queueName) => {
  logger.info('Proccessing queue messages..');

  return ch.consume(queueName, msg => processMsg(ch, msg),
    { noAck: false }); // We're going to manually ack the item after processing it
}
  

const processMsg = (ch, msg) => {
  let bookmark = JSON.parse(msg.content.toString());
  logger.info('Proccessing a new message', bookmark);

  return axios.get(bookmark.url, {
      timeout: 2000 //TODO: Move to constant
    })
    .then((res) => {
      let data = {
        is_ok: res.status == 200,
        id: bookmark.id
      };
      logger.info("About to update DB", data);

      const updateStatus = promisify(bookmarks.updateStatus);
      return updateStatus(data)
        .then(() => {
          ch.ack(msg);
          logger.info("DB Write success. ACK sent.");
        })
        .catch((err) => logger.error("DB Error", err));
    })
    .catch((err) => {
      logger.error("HTTP Error:", err);
    });
};
