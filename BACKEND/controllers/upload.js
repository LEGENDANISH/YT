const { PrismaClient } = require("@prisma/client");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuid } = require("uuid");
const { s3 } = require("../config/s3");

const prisma = new PrismaClient();


const createUpload = async (req, res) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error(" No user found in request");
      return res.status(401).json({ 
        message: "Unauthorized - No user found",
        error: "AUTH_ERROR" 
      });
    }

    const userId = req.user.id;
    const { title, description, fileSize, mimeType, originalName } = req.body;

    console.log(" Upload init request:", {
      userId,
      title,
      fileSize,
      mimeType,
      originalName
    });

    // 2. Validate required fields
    if (!title || !fileSize || !mimeType) {
      console.error(" Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["title", "fileSize", "mimeType"],
        received: { title, fileSize, mimeType }
      });
    }

    // 3. Validate file size (optional: add max size check)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        message: "File too large",
        maxSize: "5GB",
        receivedSize: `${(fileSize / 1024 / 1024 / 1024).toFixed(2)}GB`
      });
    }

    // 4. Check environment variables
    if (!process.env.S3_ENDPOINT || !process.env.S3_RAW_BUCKET) {
      console.error(" Missing S3 environment variables");
      return res.status(500).json({ 
        message: "Server configuration error - S3 not configured",
        error: "CONFIG_ERROR"
      });
    }

    const videoId = uuid();
    const s3Key = `raw/${videoId}/${originalName || "video.mp4"}`;

    console.log(" Creating video record:", { videoId, s3Key });

    // 5. Create video record in database
    try {
      await prisma.video.create({
        data: {
          id: videoId,
          title,
          description: description || "",
          userId,
          status: "UPLOADING",
          originalFileUrl: s3Key,
          fileSize,
          mimeType,
          originalName: originalName || "video.mp4",
          uploadProgress: 0,
        },
      });
      console.log(" Video record created");
    } catch (dbError) {
      console.error(" Database error:", dbError);
      return res.status(500).json({ 
        message: "Database error",
        error: "DB_ERROR",
        details: dbError.message 
      });
    }

    // 6. Generate presigned URL
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_RAW_BUCKET,
        Key: s3Key,
        ContentType: mimeType,
        ContentLength: fileSize,
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: 3600, // 1 hour
      });

      console.log("Presigned URL generated");

      res.json({ 
        videoId, 
        uploadUrl,
        s3Key,
      });
    } catch (s3Error) {
      console.error("S3 error:", s3Error);
      
      // Cleanup: delete video record if presigned URL fails
      await prisma.video.delete({ where: { id: videoId } });
      
      return res.status(500).json({ 
        message: "S3 configuration error",
        error: "S3_ERROR",
        details: s3Error.message 
      });
    }

  } catch (err) {
    console.error("Upload init failed:", err);
    res.status(500).json({ 
      message: "Upload init failed",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

module.exports = { createUpload };