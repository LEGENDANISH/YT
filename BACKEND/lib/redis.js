const Redis = require("ioredis");

// const redis = new Redis({
//   host: process.env.REDIS_HOST || "localhost",
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD,
//   tls: {}
// });

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});
redis.on("connect", () => {
  console.log("Redis connected");
});

module.exports = redis;