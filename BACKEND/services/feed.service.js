const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getTrendingVideos(limit = 20) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

  const videos = await prisma.video.findMany({
    where: {
      status: "READY",
      visibility: "PUBLIC",
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
      watchHistory: {
        where: {
          watchedAt: { gte: since },
        },
        select: {
          completed: true,
        },
      },
    },
  });

  const scored = videos.map((video) => {
    const recentViews = video.watchHistory.length;
    const recentCompletions = video.watchHistory.filter(
      (w) => w.completed
    ).length;

    const ageInHours =
      (Date.now() - new Date(video.createdAt).getTime()) / 36e5;

    const score =
      recentViews * 3 +
      recentCompletions * 5 -
      ageInHours * 0.5;

    return {
      ...video,
      trendingScore: Number(score.toFixed(2)),
    };
  });

  return scored
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

module.exports = { getTrendingVideos };
