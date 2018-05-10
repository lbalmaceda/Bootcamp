const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const logger = require('./lib/log/logger');
const enableDestroy = require('server-destroy');

const { port } = config.api;

let server;

function start(port, callback) {
  const app = express();
  const api = require('./lib/api');
  logger.info(`Starting server on env ${process.env.NODE_ENV}`);

  app.use(bodyParser.json());

  api(app);

  callback = callback || function (err) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }
    logger.info(`listening http://localhost:${port}`);
  };

  server = http.createServer(app).listen(port, callback);

  enableDestroy(server);
}

function stop(callback) {
  server.destroy(callback);
}

module.exports = {
  start: start,
  stop: stop
};

if (require.main === module) {
  start(port);
}
