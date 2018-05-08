require('dotenv').config();

module.exports = {
  db: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
  },
  rabbit: {
    queueName: process.env.RABBIT_QUEUE_NAME,
    url: process.env.RABBIT_QUEUE_URL
  },
  log: {
    level: process.env.LOG_LEVEL
  }
};
