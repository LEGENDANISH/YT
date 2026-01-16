const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Phase 1: Watch-page recommendations (basic)
 * - Exclude current video
 * - Public + READY only
 * - Recent videos first
 */
async function getVideoRecommendations(videoId, limit = 10) {
  const videos = await prisma.video.findMany({
    where: {
      status: "READY",
      visibility: "PUBLIC",
      NOT: { id: videoId },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
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

  // BigInt safety
  return videos.map((v) => ({
    ...v,
    views: Number(v.views),
    fileSize: v.fileSize ? Number(v.fileSize) : null,
  }));
}

module.exports = { getVideoRecommendations };
