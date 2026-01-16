const { Queue } = require("bullmq");

const videoQueue = new Queue("video-processing", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

module.exports = { videoQueue };