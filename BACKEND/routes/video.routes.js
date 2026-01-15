const express = require("express");
const { createUpload } = require("../controllers/upload");
const { completeUpload } = require("../controllers/completeUpload");
const { updateUploadProgress } = require("../controllers/uploadProgress.controller");
const {
  getVideoById,
  getStreamUrl,
} = require("../controllers/video.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Upload endpoints
router.post("/upload/init", authMiddleware, createUpload);
router.post("/upload/complete", authMiddleware, completeUpload);
router.put("/upload/progress/:videoId", authMiddleware, updateUploadProgress);

// Video endpoints
router.get("/:id", getVideoById);
router.get("/stream/:id", getStreamUrl);

module.exports = router;