const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getHomeFeed, getTrendingFeed } = require("../controllers/feed.controller");
const { recordView } = require("../controllers/videoView.controller");

const router = express.Router();

// Public home feed (auth optional, but keep it for now)
router.get("/home", authMiddleware, getHomeFeed);
router.post("/:id/view", authMiddleware, recordView);
router.get("/trending", authMiddleware, getTrendingFeed);

module.exports = router;
