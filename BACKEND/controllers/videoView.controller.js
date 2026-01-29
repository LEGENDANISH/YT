const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MIN_VIEW_SECONDS = 20;
const MIN_VIEW_PERCENT = 0.3;

const recordView = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.id;
    const { watchDuration } = req.body;

    // ✅ Validate duration
    if (typeof watchDuration !== "number" || watchDuration < 0) {
      return res.status(400).json({ message: "Invalid watch duration" });
    }

    // ✅ Fetch video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.status !== "READY") {
      return res.status(404).json({ message: "Video not available" });
    }

    // ✅ Determine if this watch qualifies as a view
    let qualifiesForView = watchDuration >= MIN_VIEW_SECONDS;

    if (video.duration) {
      qualifiesForView =
        qualifiesForView ||
        watchDuration / video.duration >= MIN_VIEW_PERCENT;
    }

    await prisma.$transaction(async (tx) => {
      // ✅ Build safe conditions for previous qualified views
      const conditions = [
        { watchDuration: { gte: MIN_VIEW_SECONDS } },
      ];

      if (video.duration) {
        conditions.push({
          watchDuration: {
            gte: Math.floor(video.duration * MIN_VIEW_PERCENT),
          },
        });
      }

      // 🔍 Check if user already qualified earlier
      const alreadyViewed = await tx.watchHistory.findFirst({
        where: {
          userId,
          videoId,
          OR: conditions,
        },
      });

      // 🔥 Increment views ONLY once
      if (qualifiesForView && !alreadyViewed) {
        await tx.video.update({
          where: { id: videoId },
          data: {
            views: { increment: 1 },
          },
        });
      }

      // 📝 Save watch history
      await tx.watchHistory.create({
        data: {
          userId,
          videoId,
          watchDuration,
          completed: video.duration
            ? watchDuration >= video.duration
            : false,
        },
      });
    });

    return res.json({
      message: qualifiesForView
        ? "View counted / progress saved"
        : "Watch progress recorded",
    });

  } catch (err) {
    console.error("recordView error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { recordView };
