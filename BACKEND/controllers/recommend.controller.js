const { getVideoRecommendations } = require("../services/recommendation.service");

const getWatchRecommendations = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    const videos = await getVideoRecommendations(videoId, 10);

    res.json({ videos });
  } catch (err) {
    console.error("Watch recommendations error:", err);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
};

module.exports = { getWatchRecommendations };
