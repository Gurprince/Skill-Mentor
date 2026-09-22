// queues/submissionQueue.js
const Queue = require('bull');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const submissionQueue = new Queue('submission-evaluation', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false
  }
});

module.exports = submissionQueue;
