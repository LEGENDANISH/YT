const { PrismaClient } = require("@prisma/client");
const { videoQueue } = require("../queues/videoQueue");

const prisma = new PrismaClient();

const completeUpload = async (req, res) => {
  try {
    const { videoId } = req.body;

    await prisma.video.update({
      where: { id: videoId },
      data: { status: "PROCESSING" },
    });

    await videoQueue.add("process-video", { videoId });

    res.json({ message: "Video processing started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Processing failed" });
  }
};

module.exports = { completeUpload };
