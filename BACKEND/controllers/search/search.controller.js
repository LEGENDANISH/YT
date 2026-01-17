const searchService = require("../../services/search/search.service");
const rankingService = require("../../services/search/ranking.service");
const personalizationService = require("../../services/search/personalization.service");
const blendService = require("../../services/search/blend.service");

const queryParser = require("../../queryParser");
const prisma = require("../../lib/prisma");
const redis = require("../../lib/redis");

/* ------------------ USER CONTEXT BUILDER ------------------ */
async function buildUserContext(userId) {
  if (!userId) {
    return {
      watchedVideoIds: new Set(),
      completedVideoIds: new Set(),
      recentChannelIds: new Set(),
      subscribedChannelIds: new Set()
    };
  }

  const history = await prisma.watchHistory.findMany({
    where: { userId },
    take: 100,
    orderBy: { watchedAt: "desc" },
    include: { video: true }
  });

  const subscriptions = await prisma.subscription.findMany({
    where: { subscriberId: userId }
  });

  return {
    watchedVideoIds: new Set(history.map(h => h.videoId)),
    completedVideoIds: new Set(
      history.filter(h => h.completed).map(h => h.videoId)
    ),
    recentChannelIds: new Set(history.map(h => h.video.userId)),
    subscribedChannelIds: new Set(
      subscriptions.map(s => s.channelId)
    )
  };
}

/* ------------------ CONTROLLER ------------------ */
module.exports = {
  async search(req, res) {
    try {
      /* ---------- Input ---------- */
      const rawQuery = (req.query.q || "").trim();
      const type = req.query.type || "all";
      const limit = Math.min(Number(req.query.limit) || 20, 50);

      if (!rawQuery) {
        return res.status(400).json({ error: "Query required" });
      }

      /* ---------- Phase 2: Parse Query ---------- */
      const parsedQuery = queryParser.parse(rawQuery);

      /* ---------- Phase 3: Candidate Generation ---------- */
      const {
        videoCandidates,
        channelCandidates
      } = await searchService.generateCandidates(parsedQuery, type);

      /* ---------- Phase 4: Fetch Full Data ---------- */
      let videos = [];
      let channels = [];

      if (videoCandidates.length && type !== "channel") {
        videos = await prisma.video.findMany({
          where: { id: { in: videoCandidates } },
          select: {
            id: true,
            title: true,
            views: true,
            createdAt: true,
            userId: true
          }
        });
      }

      if (channelCandidates.length && type !== "video") {
        channels = await prisma.user.findMany({
          where: { id: { in: channelCandidates } },
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        });
      }

      /* ---------- Phase 4: Ranking ---------- */
      const rankedVideos =
        type !== "channel"
          ? rankingService.rankVideos(videos, parsedQuery)
          : [];

      const rankedChannels =
        type !== "video"
          ? rankingService.rankChannels(channels)
          : [];

      /* ---------- Phase 5: Personalization ---------- */
      const userContext = await buildUserContext(req.user?.id);

      const personalizedVideos =
        type !== "channel"
          ? personalizationService.personalizeVideos(
              rankedVideos,
              userContext
            )
          : [];

      const personalizedChannels =
        type !== "video"
          ? personalizationService.personalizeChannels(
              rankedChannels,
              userContext
            )
          : [];

      /* ---------- Safety Trim (IMPORTANT) ---------- */
      const MAX_POOL = limit * 5;
      const safeVideos = personalizedVideos.slice(0, MAX_POOL);
      const safeChannels = personalizedChannels.slice(0, MAX_POOL);

      /* ---------- Phase 6: Cursor Parsing ---------- */
      let cursor = null;
      if (req.query.cursor) {
        try {
          cursor = JSON.parse(
            Buffer.from(req.query.cursor, "base64").toString()
          );
        } catch {
          cursor = null;
        }
      }

      /* ---------- Phase 6: Blending & Pagination ---------- */
      const blended = blendService.blendResults(
        safeVideos,
        safeChannels,
        limit,
        cursor
      );

      /* ---------- Phase 7: Store Search Context ---------- */
      if (req.user?.id && !req.query.cursor) {
        await redis.set(
          `search:context:${req.user.id}`,
          JSON.stringify({
            query: parsedQuery.normalizedQuery,
            tokens: parsedQuery.significantTokens,
            intent: parsedQuery.intent,
            timestamp: Date.now()
          }),
          "EX",
          600 // 10 minutes
        );
      }

      /* ---------- Response ---------- */
      return res.json({
        query: parsedQuery.normalizedQuery,
        intent: parsedQuery.intent,
        ...blended
      });
    } catch (err) {
      console.error("Search failed:", err);
      return res.status(500).json({ error: "Search failed" });
    }
  }
};
