const express = require("express");
const { createUpload } = require("../controllers/upload");
const { completeUpload } = require("../controllers/completeUpload");
const { updateUploadProgress } = require("../controllers/uploadProgress.controller");
const {
  getVideoById,
  getStreamUrl,
} = require("../controllers/video.controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const { cancelVideo } = require("../controllers/videoCancel.controller");
const { deleteVideo } = require("../controllers/videoDelete.controller");
const { updateVideo } = require("../controllers/videoUpdate.controller");
const { retryProcessing } = require("../controllers/videoRetry.controller");
const { getRecommendationsForVideo } = require("../controllers/videoRecommendation.service");
const router = express.Router();

// Upload endpoints
router.post("/upload/init", authMiddleware, createUpload);
router.post("/upload/complete", authMiddleware, completeUpload);
router.put("/upload/progress/:videoId", authMiddleware, updateUploadProgress);

// Video endpoints
router.get("/:id", getVideoById);
router.get("/stream/:id", getStreamUrl);

router.post("/:id/cancel", authMiddleware, cancelVideo);
router.delete("/:id", authMiddleware, deleteVideo);
router.put("/:id", authMiddleware, updateVideo);

router.get("/:id/recommendations", getRecommendationsForVideo);


router.post("/:id/retry-processing", authMiddleware, retryProcessing);
module.exports = router;