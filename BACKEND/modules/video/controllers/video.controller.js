const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

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
    },
  });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (video.visibility !== "PUBLIC") {
    return res.status(403).json({ message: "Video is private" });
  }

  return res.json(serializeBigInt(video));
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

  return res.json({
    streamUrl: `http://localhost:9000/${process.env.S3_PROCESSED_BUCKET}/${video.masterPlaylist}`,
  });
};

module.exports = {
  getVideoById,
  getStreamUrl,
};
