const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PAGE_SIZE = 10;
function serializeVideo(video) {
  return {
    ...video,
    views: Number(video.views),
    fileSize: video.fileSize ? Number(video.fileSize) : null,
  };
}

const getHomeFeed = async (req, res) => {
  try {
    const { cursor } = req.query;

    const videos = await prisma.video.findMany({
      where: {
        status: "READY",
        visibility: "PUBLIC",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: PAGE_SIZE + 1,
      ...(cursor && {
        cursor: { createdAt: new Date(cursor) },
        skip: 1,
      }),
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

    let nextCursor = null;
    if (videos.length > PAGE_SIZE) {
      const nextItem = videos.pop();
      nextCursor = nextItem.createdAt;
    }

 res.json({
  videos: videos.map(serializeVideo),
  nextCursor,
});
  } catch (err) {
    console.error("Home feed error:", err);
    res.status(500).json({ message: "Failed to load feed" });
  }
};

module.exports = { getHomeFeed };
