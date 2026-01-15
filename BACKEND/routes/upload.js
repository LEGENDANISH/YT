import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // REQUIRED for MinIO
});

export const createUpload = async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const { title, description, fileSize, mimeType, originalName } = req.body;

  const videoId = uuid();
  const s3Key = `raw/${videoId}.mp4`;

  // 1️⃣ Create DB record
  const video = await prisma.video.create({
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

  // 2️⃣ Create upload session
  await prisma.uploadSession.create({
    data: {
      videoId,
      totalChunks: 1,
      chunkSize: fileSize,
      totalSize: BigInt(fileSize),
    },
  });

  // 3️⃣ Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.S3_RAW_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 60,
  });

  res.json({
    videoId,
    uploadUrl,
  });
};
