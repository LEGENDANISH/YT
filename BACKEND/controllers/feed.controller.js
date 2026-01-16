const { PrismaClient } = require("@prisma/client");
const { getTrendingVideos } = require("../services/feed.service");
const { getHybridFeed } = require("../services/hybridRank.service");

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
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor && {
        cursor: { createdAt: new Date(cursor) },
        skip: 1,
      }),
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
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

const getTrendingFeed = async (req, res) => {
  try {
    const videos = await getTrendingVideos();

    res.json({
      videos: videos.map(serializeVideo), // ✅ REQUIRED
    });
  } catch (err) {
    console.error("Trending feed error:", err);
    res.status(500).json({ message: "Failed to load trending feed" });
  }
};

const getHybridHomeFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await getHybridFeed(userId);

    res.json({ videos });
  } catch (err) {
    console.error("Hybrid feed error:", err);
    res.status(500).json({ message: "Failed to load hybrid feed" });
  }
};

module.exports = { getHomeFeed, getTrendingFeed ,getHybridHomeFeed};
