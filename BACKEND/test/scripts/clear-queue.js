    const { Queue } = require("bullmq");

const clearQueue = async () => {
  const queue = new Queue("video-processing", {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    },
  });

  await queue.obliterate({ force: true });
  console.log("✅ Queue cleared");
  process.exit(0);
};

clearQueue();