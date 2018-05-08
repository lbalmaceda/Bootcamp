const config = require('../../config');

const winston = require('winston');

winston.level = config.log.level;

module.exports = winston;
