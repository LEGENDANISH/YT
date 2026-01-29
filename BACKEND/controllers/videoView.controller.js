const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MIN_VIEW_SECONDS = 20;
const MIN_VIEW_PERCENT = 0.3;

const recordView = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.id;
    const { watchDuration } = req.body;

    console.log("\n========== RECORD VIEW REQUEST ==========");
    console.log("📹 Video ID:", videoId);
    console.log("👤 User ID:", userId);
    console.log("⏱️ Watch Duration:", watchDuration);

    // ✅ Validate duration
    if (typeof watchDuration !== "number" || watchDuration < 0) {
      console.log("❌ Invalid watch duration");
      return res.status(400).json({ message: "Invalid watch duration" });
    }

    // ✅ Fetch video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      console.log("❌ Video not found");
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.status !== "READY") {
      console.log("❌ Video not ready, status:", video.status);
      return res.status(404).json({ message: "Video not available" });
    }

    console.log("✅ Video found:", {
      title: video.title,
      duration: video.duration,
      currentViews: video.views
    });

    // ⚠️ Log warning if duration is missing
    if (!video.duration) {
      console.warn("⚠️ Video has no duration set - using time-based view only");
    }

    // ✅ Determine if this watch qualifies as a view
    let qualifiesForView = watchDuration >= MIN_VIEW_SECONDS;

    if (video.duration) {
      const percentWatched = watchDuration / video.duration;
      console.log(`📊 Percent watched: ${(percentWatched * 100).toFixed(1)}%`);
      
      qualifiesForView =
        qualifiesForView ||
        percentWatched >= MIN_VIEW_PERCENT;
    }

    console.log(`🎯 Qualifies for view: ${qualifiesForView}`);

    const result = await prisma.$transaction(async (tx) => {
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

      console.log("🔍 Checking if user already viewed...");

      // 🔍 Check if user already qualified earlier
      const alreadyViewed = await tx.watchHistory.findFirst({
        where: {
          userId,
          videoId,
          OR: conditions,
        },
      });

      console.log(`📝 Already viewed: ${!!alreadyViewed}`);

      let viewIncremented = false;

      // 🔥 Increment views ONLY once per user
      if (qualifiesForView && !alreadyViewed) {
        console.log("✅ Incrementing view count...");
        
        const updatedVideo = await tx.video.update({
          where: { id: videoId },
          data: {
            views: { increment: 1 },
          },
        });

        console.log(`🎉 View count incremented! New count: ${updatedVideo.views}`);
        viewIncremented = true;
      } else if (alreadyViewed) {
        console.log("⏭️ View already counted for this user");
      } else {
        console.log("⏭️ Watch duration not sufficient for view");
      }

      // 📝 Save/update watch history
      console.log("💾 Saving watch history...");

// Inside the transaction, replace the create with:

const watchHistory = await tx.watchHistory.upsert({
  where: {
    userId_videoId: {
      userId,
      videoId,
    },
  },
  update: {
    watchDuration,
    completed: video.duration
      ? watchDuration >= video.duration
      : false,
    watchedAt: new Date(),
  },
  create: {
    userId,
    videoId,
    watchDuration,
    completed: video.duration
      ? watchDuration >= video.duration
      : false,
  },
});


      console.log("✅ Watch history saved:", watchHistory.id);

      return { viewIncremented, watchHistory };
    });

    console.log("========== RECORD VIEW COMPLETE ==========\n");

    return res.json({
      message: result.viewIncremented
        ? "View counted / progress saved"
        : "Watch progress recorded",
      viewCounted: result.viewIncremented,
    });

  } catch (err) {
    console.error("❌ recordView error:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { recordView };