require("dotenv").config();

const axios = require("axios");
const amqp = require("amqplib");

const queueName = process.env.RABBIT_QUEUE_NAME;
const rabbitURL = process.env.RABBIT_QUEUE_URL;

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
    console.error(e);
  }
};

main(queueName, rabbitURL);

const processQueue = (ch, queueName) =>
  // We're going to manually ack the item after processing it
  ch.consume(queueName, msg => processMsg(ch, msg), { noAck: false });

const processMsg = (ch, msg) => {
  console.log('Proccessing a new message..');

  //TODO: Check link and update item in db

  ch.ack(msg);
};