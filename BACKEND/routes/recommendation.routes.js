const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getRelated } = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/videos/:id/related", authMiddleware, getRelated);

module.exports = router;
