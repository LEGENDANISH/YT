import express from "express";
import { createUpload } from "../controllers/upload.js";
import { completeUpload } from "../controllers/completeUpload.js";
import { getVideoById, getStreamUrl } from "../controllers/video.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

/**
 * INITIATE UPLOAD
 * returns presigned URL
 */
router.post(
  "/upload/init",
  authMiddleware,
  createUpload
);

/**
 * COMPLETE UPLOAD
 * triggers processing
 */
router.post(
  "/upload/complete",
  authMiddleware,
  completeUpload
);

/**
 * GET VIDEO METADATA
 */
router.get(
  "/:id",
  getVideoById
);

/**
 * GET STREAM URL (master.m3u8)
 */
router.get(
  "/stream/:id",
  getStreamUrl
);

export default router;
