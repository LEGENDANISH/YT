const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Phase 3 — Trending Videos
 * Global popularity (no user context)
 */
const getTrendingVideos = async () => {
  const videos = await prisma.video.findMany({
    where: {
      status: "READY",
      visibility: "PUBLIC",
    },
    orderBy: [
      { views: "desc" },       // popularity
      { createdAt: "desc" },   // freshness
    ],
    take: 50,
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

  // 🔴 VERY IMPORTANT (BigInt → Number)
  return videos.map((v) => ({
    ...v,
    views: Number(v.views),
    fileSize: v.fileSize ? Number(v.fileSize) : null,
  }));
};

module.exports = { getTrendingVideos };
