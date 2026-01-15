// worker.js
const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { Readable } = require("stream");

const execPromise = promisify(exec);
const prisma = new PrismaClient();

// --------------------
// S3 CLIENT
// --------------------
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

// --------------------
// TEMP DIRECTORY (CROSS-PLATFORM)
// --------------------
const BASE_TEMP_DIR = path.join(os.tmpdir(), "yt-worker");

if (!fs.existsSync(BASE_TEMP_DIR)) {
  fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
}

// --------------------
// WORKER
// --------------------
const worker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, userId, s3Key } = job.data;

    console.log(`🎬 Processing video: ${videoId}`);
    console.log(`📁 S3 Key: ${s3Key}`);

    const localInput = path.join(BASE_TEMP_DIR, `${videoId}-input.mp4`);
    const outputDir = path.join(BASE_TEMP_DIR, videoId);

    try {
      // --------------------
      // UPDATE STATUS
      // --------------------
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "PROCESSING" },
      });

      // --------------------
      // DOWNLOAD FROM S3
      // --------------------
      console.log(`📥 Downloading video from S3...`);

      const rawObject = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_RAW_BUCKET,
          Key: s3Key,
        })
      );

      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(localInput);
        Readable.from(rawObject.Body).pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      console.log(`✅ Downloaded to ${localInput}`);

      // --------------------
      // CREATE OUTPUT DIR
      // --------------------
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // --------------------
      // TRANSCODE (HLS)
      // --------------------
      console.log(`🎞️ Transcoding video with FFmpeg...`);

     const ffmpegCommand = `ffmpeg -y -i "${localInput}" \
-map 0:v -map 0:a -map 0:v -map 0:a \
-c:v libx264 -crf 22 -c:a aac -ar 48000 \
-filter:v:0 scale=640:360 -maxrate:v:0 800k -bufsize:v:0 1200k -b:a:0 96k \
-filter:v:1 scale=1280:720 -maxrate:v:1 2800k -bufsize:v:1 4200k -b:a:1 128k \
-var_stream_map "v:0,a:0 v:1,a:1" \
-master_pl_name master.m3u8 \
-f hls -hls_time 6 -hls_playlist_type vod \
-hls_segment_filename "${outputDir}/stream_%v_%03d.ts" \
"${outputDir}/stream_%v.m3u8"`;


   await execPromise(ffmpegCommand);

const generatedFiles = fs.readdirSync(outputDir);
console.log("🧪 Generated files:", generatedFiles);

if (generatedFiles.length === 0) {
  throw new Error("FFmpeg produced no output files");
}

console.log(`✅ Transcoding complete`);


      // --------------------
      // UPLOAD PROCESSED FILES
      // --------------------
      console.log(`📤 Uploading HLS files to S3...`);

      const files = fs.readdirSync(outputDir);

      for (const file of files) {
        const filePath = path.join(outputDir, file);
        const fileBody = fs.readFileSync(filePath);

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_PROCESSED_BUCKET,
            Key: `videos/${videoId}/${file}`,
            Body: fileBody,
            ContentType: file.endsWith(".m3u8")
              ? "application/vnd.apple.mpegurl"
              : "video/mp2t",
          })
        );
      }

      console.log(`✅ Uploaded ${files.length} files`);

      // --------------------
      // UPDATE STATUS → READY
      // --------------------
     await prisma.video.update({
  where: { id: videoId },
  data: {
    status: "READY",
    visibility: "PUBLIC",
    masterPlaylist: `videos/${videoId}/master.m3u8`,
  },
});


      console.log(`🎉 Video ${videoId} READY`);

    } catch (error) {
      console.error(`❌ Processing failed for ${videoId}:`, error);

      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED" },
      });

      throw error;
    } finally {
      // --------------------
      // CLEANUP
      // --------------------
      if (fs.existsSync(localInput)) fs.unlinkSync(localInput);
      if (fs.existsSync(outputDir))
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000,
    },
  }
);

// --------------------
// EVENTS
// --------------------
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("👷 Video processing worker started");
