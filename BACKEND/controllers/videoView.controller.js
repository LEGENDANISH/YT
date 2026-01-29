const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MIN_VIEW_SECONDS = 30;
const MIN_VIEW_PERCENT = 0.3;

const recordView = async (req, res) => {
  const { id: videoId } = req.params;
  const userId = req.user.id;
  const { watchDuration } = req.body;

  if (typeof watchDuration !== "number" || watchDuration < 0) {
    return res.status(400).json({ message: "Invalid watch duration" });
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
  });

  if (!video || video.status !== "READY") {
    return res.status(404).json({ message: "Video not available" });
  }

  const qualifiesForView =
    watchDuration >= MIN_VIEW_SECONDS ||
    watchDuration / video.duration >= MIN_VIEW_PERCENT;

  await prisma.$transaction(async (tx) => {
    // Check if view already counted
    const existingView = await tx.watchHistory.findFirst({
      where: {
        userId,
        videoId,
        viewCounted: true,
      },
    });

    // Increment views ONCE
    if (qualifiesForView && !existingView) {
      await tx.video.update({
        where: { id: videoId },
        data: {
          views: { increment: 1 },
        },
      });
    }

    // Save / update watch history
    await tx.watchHistory.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      update: {
        watchDuration: {
          increment: watchDuration,
        },
        completed: watchDuration >= video.duration,
        viewCounted: qualifiesForView || existingView?.viewCounted,
      },
      create: {
        userId,
        videoId,
        watchDuration,
        completed: watchDuration >= video.duration,
        viewCounted: qualifiesForView,
      },
    });
  });

  res.json({
    message: qualifiesForView
      ? "View recorded"
      : "Watch progress recorded",
  });
};

module.exports = { recordView };
