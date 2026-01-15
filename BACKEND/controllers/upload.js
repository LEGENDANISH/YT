const { PrismaClient } = require("@prisma/client");
const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuid } = require("uuid");

const prisma = new PrismaClient();

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const createUpload = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, fileSize, mimeType, originalName } = req.body;

    const videoId = uuid();
    const s3Key = `raw/${videoId}.mp4`;

    await prisma.video.create({
      data: {
        id: videoId,
        title,
        description,
        userId,
        status: "UPLOADING",
        originalFileUrl: s3Key,
        fileSize,
        mimeType,
        originalName,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_RAW_BUCKET,
      Key: s3Key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    res.json({ videoId, uploadUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload init failed" });
  }
};

module.exports = { createUpload };
