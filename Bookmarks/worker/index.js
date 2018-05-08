require('dotenv').config();
const axios = require('axios');
const {promisify} = require('util');
const bookmarks = require('../lib/db/bookmarks.js');

const q = process.env.RABBIT_QUEUE_NAME;
const open = require('amqplib').connect(process.env.RABBIT_QUEUE_URL);


// Consumer
open
  .then((conn) => {
    return conn.createChannel()
                .then((ch) => ch.assertQueue(q, {durable: true})
                    .then(() => processQueue(ch))
                    // .then(() => ch.close()))
                ).catch(console.warn)
                // .then(() => conn.close());
  })
  .catch(console.warn);


  const processQueue = (ch) => {
    return ch.consume(q,
        (msg) => processMsg(ch, msg),
        //We're going to manually ack the item after proccessing it
        { noAck: false });
  }

  const processMsg = (ch, msg) => {
    console.log("Proccessing a new message..");
    console.log(msg);
    //TODO: Check link and update item in db
    ch.ack(msg);
  }
