// controllers/videoAnalytics.controller.js
const prisma = require("../../prisma/client"); 

exports.getSingleVideoAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params
    const channelId = req.user.id

    // 1️⃣ Verify ownership
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: channelId
      },
      select: {
        id: true,
        title: true,
        views: true
      }
    })

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" })
    }

    // 2️⃣ Watch time
    const watchStats = await prisma.watchHistory.aggregate({
      where: { videoId },
      _sum: { watchDuration: true }
    })

    const watchTimeSeconds = watchStats._sum.watchDuration || 0

    // 3️⃣ Subscribers gained from this video
    const subscribersGained = await prisma.subscription.count({
      where: {
        channelId,
        subscriber: {
          watchHistory: {
            some: {
              videoId,
              watchedAt: {
                lt: prisma.subscription.fields.createdAt
              }
            }
          }
        }
      }
    })

    // 4️⃣ Likes count
    const likes = await prisma.like.count({
      where: { videoId }
    })

    // 5️⃣ Comments count
    const comments = await prisma.comment.count({
      where: { videoId }
    })

    return res.json({
      success: true,
      videoId: video.id,
      title: video.title,
      views: video.views,
      watchTimeSeconds,
      watchTimeMinutes: +(watchTimeSeconds / 60).toFixed(2),
      watchTimeHours: +(watchTimeSeconds / 3600).toFixed(2),
      subscribersGained,
      likes,
      comments
    })
  } catch (err) {
    console.error("Video analytics error:", err)
    res.status(500).json({ success: false, message: "Failed to fetch video analytics" })
  }
}
