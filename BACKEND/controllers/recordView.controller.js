const { PrismaClient } = require("@prisma/client");
const { processWatchSignal } = require("../services/watchSignal.service");

const prisma = new PrismaClient();

/**
 * POST /api/videos/:id/view
 * Records watch progress + completion
 */
const recordView = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.id;
    const { watchDuration, completed } = req.body;

    // ------------------------
    // Validation
    // ------------------------
    if (!watchDuration || watchDuration < 1) {
      return res.status(400).json({
        message: "Invalid watch duration",
      });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.status !== "READY") {
      return res.status(404).json({
        message: "Video not available",
      });
    }

    // ------------------------
    // Check if already completed before
    // ------------------------
    const alreadyCompleted = await prisma.watchHistory.findFirst({
      where: {
        userId,
        videoId,
        completed: true,
      },
    });

    // ------------------------
    // Transaction (safe)
    // ------------------------
    await prisma.$transaction(async (tx) => {
      // Increment views ONLY once per user (on first completion)
      if (completed && !alreadyCompleted) {
        await tx.video.update({
          where: { id: videoId },
          data: {
            views: { increment: 1 },
          },
        });
      }

      // Always store watch history
      await tx.watchHistory.create({
        data: {
          userId,
          videoId,
          watchDuration,
          completed: completed ?? false,
        },
      });
    });

    // ------------------------
    // 🔥 Phase 4: Process watch signal
    // ------------------------
    await processWatchSignal({
      userId,
      videoId,
      watchDuration,
      completed,
    });

    return res.json({
      message: completed
        ? "View recorded (completed)"
        : "Watch progress recorded",
    });
  } catch (err) {
    console.error("recordView error:", err);
    res.status(500).json({
      message: "Failed to record view",
    });
  }
};

module.exports = { recordView };