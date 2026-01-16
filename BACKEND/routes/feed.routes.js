const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getHomeFeed } = require("../controllers/feed.controller");

const router = express.Router();

// Public home feed (auth optional, but keep it for now)
router.get("/home", authMiddleware, getHomeFeed);

module.exports = router;
