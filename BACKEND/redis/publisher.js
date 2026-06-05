const Redis = require("ioredis");

const publisher = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: {}
});

const publishVideoUpdate = async (userId, videoId, data) => {
  await publisher.publish(
    "video:updates",
    JSON.stringify({ userId, videoId, ...data })
  );
};

module.exports = { publishVideoUpdate };