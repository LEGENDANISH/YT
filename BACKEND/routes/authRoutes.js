const express = require("express");
const { registerUser, loginUser, updateUser, deleteUser, aboutme, getMyUploadedVideos, getChannelDetails } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");


const router = express.Router();

// routes/authRoutes.js
router.post("/register", registerUser);
router.get("/aboutme", authMiddleware, aboutme);
router.post("/login", loginUser);
router.put("/update", authMiddleware, updateUser);
router.delete("/delete", authMiddleware, deleteUser);
router.get("/my-videos", authMiddleware, getMyUploadedVideos);

router.get("/channel/:channelId", getChannelDetails);

module.exports = router;