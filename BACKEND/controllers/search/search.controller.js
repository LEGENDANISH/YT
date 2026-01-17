const searchService = require("./search.service");
const rankingService = require("./ranking.service");
const queryParser = require("./queryParser");
const prisma = require("../../lib/prisma");

module.exports = {
  async search(req, res) {
    try {
      const rawQuery = (req.query.q || "").trim();
      const type = req.query.type || "all";

      if (!rawQuery) {
        return res.status(400).json({ error: "Query required" });
      }

      const parsedQuery = queryParser.parse(rawQuery);

      /* -------- Phase 3: Candidate Generation -------- */
      const {
        videoCandidates,
        channelCandidates
      } = await searchService.generateCandidates(parsedQuery, type);

      /* -------- Phase 4: Fetch Full Data -------- */
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

      /* -------- Phase 4: Ranking -------- */
      const rankedVideos =
        type !== "channel"
          ? rankingService.rankVideos(videos, parsedQuery)
          : [];

      const rankedChannels =
        type !== "video"
          ? rankingService.rankChannels(channels)
          : [];

      /* -------- Response -------- */
      res.json({
        query: parsedQuery.normalizedQuery,
        intent: parsedQuery.intent,
        videos: rankedVideos,
        channels: rankedChannels
      });
    } catch (err) {
      console.error("Search failed:", err);
      res.status(500).json({ error: "Search failed" });
    }
  }
};
