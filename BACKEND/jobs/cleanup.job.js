const { PrismaClient } = require("@prisma/client");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../lib/s3");

const prisma = new PrismaClient();

async function cleanup() {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour

  const staleVideos = await prisma.video.findMany({
    where: {
      status: { in: ["UPLOADING", "PROCESSING", "FAILED"] },
      updatedAt: { lt: cutoff },
    },
  });

  for (const video of staleVideos) {
    if (video.originalFileUrl) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_RAW_BUCKET,
          Key: video.originalFileUrl,
        })
      ).catch(() => {});
    }

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "FAILED" },
    });
  }

  console.log(`🧹 Cleanup completed: ${staleVideos.length} videos`);
}

cleanup();
