const express = require("express");
const { createUpload } = require("../controllers/upload");
const { completeUpload } = require("../controllers/completeUpload");
const {
  getVideoById,
  getStreamUrl,
} = require("../controllers/video.controller");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

/**
 * INITIATE UPLOAD
 */
router.post("/upload/init", authMiddleware, createUpload);

/**
 * COMPLETE UPLOAD
 */
router.post("/upload/complete", authMiddleware, completeUpload);

/**
 * GET VIDEO METADATA
 */
router.get("/:id", getVideoById);

/**
 * GET STREAM URL
 */
router.get("/stream/:id", getStreamUrl);

module.exports = router;
