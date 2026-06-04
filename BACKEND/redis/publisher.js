const Redis = require("ioredis");

const publisher = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

const publishVideoUpdate = async (userId, videoId, data) => {
  await publisher.publish(
    "video:updates",
    JSON.stringify({ userId, videoId, ...data })
  );
};

module.exports = { publishVideoUpdate };