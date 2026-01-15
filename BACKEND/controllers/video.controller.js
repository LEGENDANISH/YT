const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getVideoById = async (req, res) => {
  const { id } = req.params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      qualities: true,
    },
  });

  if (!video || video.visibility !== "PUBLIC") {
    return res.status(404).json({ message: "Video not found" });
  }

  res.json(video);
};

const getStreamUrl = async (req, res) => {
  const { id } = req.params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: {
      status: true,
      masterPlaylist: true,
    },
  });

  if (!video || video.status !== "READY") {
    return res.status(404).json({ message: "Video not ready" });
  }

  res.json({
    streamUrl: `${process.env.S3_ENDPOINT}/${process.env.S3_PROCESSED_BUCKET}/${video.masterPlaylist}`,
  });
};

module.exports = {
  getVideoById,
  getStreamUrl,
};
