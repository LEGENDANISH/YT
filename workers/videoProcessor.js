import { exec } from "child_process";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

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

export const processVideo = async (job) => {
  const { videoId } = job.data;

  const rawKey = `raw/${videoId}.mp4`;
  const localInput = `/tmp/${videoId}.mp4`;
  const outputDir = `/tmp/${videoId}`;

  // 1️⃣ Download raw video
  const rawObject = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_RAW_BUCKET,
      Key: rawKey,
    })
  );

  await new Promise((res) =>
    rawObject.Body.pipe(fs.createWriteStream(localInput)).on("finish", res)
  );

  fs.mkdirSync(outputDir);

  // 2️⃣ Transcode to HLS
  await execPromise(`
    ffmpeg -i ${localInput} \
    -map 0:v -map 0:a \
    -b:v:0 800k -s:v:0 640x360 \
    -b:v:1 2000k -s:v:1 1280x720 \
    -var_stream_map "v:0,a:0 v:1,a:0" \
    -master_pl_name master.m3u8 \
    -f hls -hls_time 6 \
    ${outputDir}/stream_%v.m3u8
  `);

  // 3️⃣ Upload processed files
  const files = fs.readdirSync(outputDir);

  for (const file of files) {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_PROCESSED_BUCKET,
        Key: `videos/${videoId}/${file}`,
        Body: fs.createReadStream(path.join(outputDir, file)),
      })
    );
  }

  // 4️⃣ Update DB
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: "READY",
      masterPlaylist: `videos/${videoId}/master.m3u8`,
    },
  });
};
