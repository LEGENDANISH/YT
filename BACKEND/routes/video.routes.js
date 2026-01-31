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
const { recordView } = require("../controllers/recordView.controller");
const { getWatchRecommendations } = require("../controllers/recommend.controller");
const { getAutoplayNext } = require("../controllers/autoplay.controller");
const { likedvideos, likeVideo, unlikeVideo, getVideoLikes } = require("../controllers/likedvideo.Controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// liked videos routes FIRST
router.get("/likedvideos", authMiddleware, likedvideos);
router.post("/like/:videoId", authMiddleware, likeVideo);
router.delete("/like/:videoId", authMiddleware, unlikeVideo);

// Upload endpoints
router.post("/upload/init", authMiddleware,  upload.single("thumbnail"), // 👈 optional thumbnail
  createUpload);
router.post("/upload/complete", authMiddleware, completeUpload);
router.put("/upload/progress/:videoId", authMiddleware, updateUploadProgress);

// Video endpoints
router.get("/stream/:id", getStreamUrl);
router.get("/:id", getVideoById);

router.post("/:id/cancel", authMiddleware, cancelVideo);
router.delete("/:id", authMiddleware, deleteVideo);
router.put("/:id", authMiddleware, updateVideo);

router.get("/:id/recommendations", getRecommendationsForVideo);
router.get("/:id/autoplay", authMiddleware, getAutoplayNext);

router.post("/:id/view", authMiddleware, recordView);
router.get("/:id/recommend", getWatchRecommendations);

router.post("/:id/retry-processing", authMiddleware, retryProcessing);


router.get("/:id/likes", authMiddleware, getVideoLikes);


module.exports = router;