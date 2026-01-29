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
      console.log("🔍 Checking if user already viewed...");

      // ✅ FIX: Use findUnique instead of findFirst to check existing history
      const existingHistory = await tx.watchHistory.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        select: {
          id: true,
          watchDuration: true,
          completed: true,
        },
      });

      console.log(`📝 Existing watch history: ${existingHistory ? "Found" : "None"}`);

      let viewIncremented = false;

      // ✅ FIX: Proper qualification checking
      if (qualifiesForView) {
        if (!existingHistory) {
          // First time watching - count the view
          viewIncremented = true;
          console.log("✅ First time watch - will count view");
        } else {
          // Check if the previous watch qualified (using BOTH rules)
          const previouslyQualified =
            existingHistory.watchDuration >= MIN_VIEW_SECONDS ||
            (video.duration && existingHistory.watchDuration >= video.duration * MIN_VIEW_PERCENT);

          if (!previouslyQualified) {
            // Previous watch didn't qualify, but this one does
            viewIncremented = true;
            console.log("✅ Previous watch didn't qualify - will count view now");
          } else {
            console.log("⏭️ View already counted previously");
          }
        }
      } else {
        console.log("⏭️ Watch duration not sufficient for view");
      }

      // 📈 Increment view count if needed
      let updatedVideo = null;
      if (viewIncremented) {
        console.log("📈 Incrementing view count...");
        
        updatedVideo = await tx.video.update({
          where: { id: videoId },
          data: {
            views: { increment: 1 },
          },
        });

        console.log(`🎉 View count incremented! New count: ${updatedVideo.views}`);
      }

      // 📝 Save/update watch history
      console.log("💾 Saving watch history...");

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

      return { 
        viewIncremented, 
        watchHistory,
        newViewCount: updatedVideo ? updatedVideo.views : video.views 
      };
    });

    console.log("========== RECORD VIEW COMPLETE ==========\n");

    return res.json({
      message: result.viewIncremented
        ? "View counted / progress saved"
        : "Watch progress recorded",
      viewCounted: result.viewIncremented,
      viewCount: result.newViewCount, // ✅ Added: Return the actual view count
    });

  } catch (err) {
    console.error("❌ recordView error:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { recordView };