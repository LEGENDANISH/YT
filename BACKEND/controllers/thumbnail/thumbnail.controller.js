const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/s3");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const updateThumbnail = async (req, res) => {
  try {
    const { videoId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const thumbKey = `thumbnails/${videoId}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_PROCESSED_BUCKET,
        Key: thumbKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const thumbUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_PROCESSED_BUCKET}/${thumbKey}`;

    await prisma.video.update({
      where: { id: videoId },
      data: { thumbnailUrl: thumbUrl },
    });

    res.json({ message: "Thumbnail updated", thumbnailUrl: thumbUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update thumbnail" });
  }
};

module.exports = { updateThumbnail };
