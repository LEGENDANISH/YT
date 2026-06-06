const { Queue } = require("bullmq");

// const videoQueue = new Queue("video-processing", {
//   connection: {
//     host: process.env.REDIS_HOST,
//     port: parseInt(process.env.REDIS_PORT) || 6379,
//     password: process.env.REDIS_PASSWORD,
//     tls: {}
//   },
// });
const videoQueue = new Queue("video-processing", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
});
module.exports = { videoQueue };