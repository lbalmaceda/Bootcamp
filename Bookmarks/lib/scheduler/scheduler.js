require('dotenv').config();
const {promisify} = require('util');
const bookmarks = require('../db/bookmarks.js');

var q = process.env.RABBIT_QUEUE_NAME;
var open = require('amqplib').connect(process.env.RABBIT_QUEUE_URL);


// set up a CRON job to call this scheduler regularly

// Publisher
open
  .then((conn) => {
    return conn.createChannel()
                .then((ch) => ch.assertQueue(q)
                    .then(() => updateQueue(ch))
                    .then(() => ch.close()))
                .then(() => conn.close())
  })
  .catch(console.warn);


//returns promise
const updateQueue = (ch) => {
    return queryBookmarks()
      .then((items) => {
        const promises = items.map((item) => {
          const buffer = new Buffer(JSON.stringify(item));
          return Promise.resolve(ch.sendToQueue(q, buffer, {persistent: true}));
        });

        return Promise.all(promises)
                .catch(console.warn);
      });
}


//query db for bookmarks to check
//returns promise
const queryBookmarks = () => {
  const findAll = promisify(bookmarks.findAll);
  return findAll()
    .catch(console.warn)
}