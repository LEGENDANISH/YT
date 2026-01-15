const { PrismaClient } = require("@prisma/client");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../lib/s3");

const prisma = new PrismaClient();

const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const video = await prisma.video.findUnique({ where: { id } });

  if (!video || video.userId !== userId) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Delete processed files (best-effort)
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_PROCESSED_BUCKET,
      Key: `videos/${id}/`,
    })
  ).catch(() => {});

  // Delete raw file
  if (video.originalFileUrl) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_RAW_BUCKET,
        Key: video.originalFileUrl,
      })
    ).catch(() => {});
  }

  await prisma.video.update({
    where: { id },
  });

  res.json({ message: "Video deleted" });
};

module.exports = { deleteVideo };
