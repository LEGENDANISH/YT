const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { Readable } = require("stream");
const ffmpeg = require("fluent-ffmpeg");

const execPromise = promisify(exec);
const prisma = new PrismaClient();

// S3 CLIENT
const { s3 } = require("./config/s3");

// TEMP DIRECTORY (CROSS-PLATFORM)
const BASE_TEMP_DIR = path.join(os.tmpdir(), "yt-worker");
if (!fs.existsSync(BASE_TEMP_DIR)) {
  fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
}

// GET VIDEO DURATION HELPER WITH EXTENSIVE LOGGING
const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`📹 [DURATION] Starting ffprobe on: ${filePath}`);
    console.log(`📹 [DURATION] File exists: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`📹 [DURATION] File size: ${stats.size} bytes`);
    }
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`❌ [DURATION] ffprobe error:`, err);
        return reject(err);
      }
      
      console.log(`📹 [DURATION] Metadata received:`, JSON.stringify(metadata, null, 2));
      
      if (!metadata || !metadata.format || !metadata.format.duration) {
        console.error(`❌ [DURATION] Missing duration in metadata`);
        return reject(new Error("Duration not found in metadata"));
      }
      
      const duration = Math.floor(metadata.format.duration);
      console.log(`✅ [DURATION] Extracted duration: ${duration} seconds`);
      resolve(duration);
    });
  });
};

// GENERATE THUMBNAIL HELPER
const generateThumbnail = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    console.log(`🎨 [FFMPEG] Starting thumbnail generation...`);
    console.log(`🎨 [FFMPEG] Input: ${inputPath}`);
    console.log(`🎨 [FFMPEG] Output: ${outputPath}`);
    console.log(`🎨 [FFMPEG] Output dir: ${path.dirname(outputPath)}`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log(`🎨 [FFMPEG] Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ["10%"],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: "1280x720",
      })
      .on("start", (commandLine) => {
        console.log(`🎨 [FFMPEG] Command: ${commandLine}`);
      })
      .on("end", () => {
        console.log(`🎨 [FFMPEG] Thumbnail generation completed`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`❌ [FFMPEG] Thumbnail generation error:`, err);
        reject(err);
      });
  });
};

// WORKER
const worker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, userId, s3Key } = job.data;
    console.log(`Processing video: ${videoId}`);
    console.log(`S3 Key: ${s3Key}`);

    const localInput = path.join(BASE_TEMP_DIR, `${videoId}-input.mp4`);
    const outputDir = path.join(BASE_TEMP_DIR, videoId);
    const thumbnailPath = path.join(BASE_TEMP_DIR, `${videoId}-thumb.jpg`);
    let videoDuration = null;

    try {
      // CHECK IF VIDEO EXISTS FIRST
      const videoExists = await prisma.video.findUnique({
        where: { id: videoId },
      });
      if (!videoExists) {
        console.error(`❌ Video ${videoId} NOT FOUND in database`);
        return; // Exit job without error
      }

      console.log(`✅ Video ${videoId} found, processing...`);

      // UPDATE STATUS
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: "PROCESSING",
          processingStage: "DOWNLOAD",
        },
      });

      // DOWNLOAD FROM S3
      console.log(`Downloading video from S3...`);
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

      console.log(`Downloaded to ${localInput}`);

      // --------------------
      // THUMBNAIL GENERATION
      // --------------------
      console.log("🎨 [THUMBNAIL] Starting thumbnail check...");

      // Re-check if thumbnail was already generated (in case of retries)
      const currentVideo = await prisma.video.findUnique({
        where: { id: videoId },
        select: { thumbnailUrl: true }
      });

      console.log(`🎨 [THUMBNAIL] Current thumbnailUrl in DB: ${currentVideo.thumbnailUrl}`);

      if (!currentVideo.thumbnailUrl) {
        console.log("🎨 [THUMBNAIL] No thumbnail found — generating...");
        
        try {
          // Generate thumbnail
          console.log(`🎨 [THUMBNAIL] Generating thumbnail from: ${localInput}`);
          console.log(`🎨 [THUMBNAIL] Output path: ${thumbnailPath}`);
          
          await generateThumbnail(localInput, thumbnailPath);
          
          // Verify thumbnail file was created
          if (!fs.existsSync(thumbnailPath)) {
            throw new Error(`Thumbnail file not created at ${thumbnailPath}`);
          }
          
          const thumbStats = fs.statSync(thumbnailPath);
          console.log(`🎨 [THUMBNAIL] Thumbnail created, size: ${thumbStats.size} bytes`);
          
          // Read thumbnail
          const thumbBuffer = fs.readFileSync(thumbnailPath);
          console.log(`🎨 [THUMBNAIL] Thumbnail buffer size: ${thumbBuffer.length} bytes`);
          
          const thumbKey = `thumbnails/${videoId}.jpg`;
          console.log(`🎨 [THUMBNAIL] Uploading to S3 with key: ${thumbKey}`);
          console.log(`🎨 [THUMBNAIL] Bucket: ${process.env.S3_PROCESSED_BUCKET}`);
          
          // Upload to S3
          const uploadResult = await s3.send(
            new PutObjectCommand({
              Bucket: process.env.S3_PROCESSED_BUCKET,
              Key: thumbKey,
              Body: thumbBuffer,
              ContentType: "image/jpeg",
            })
          );
          
          console.log(`🎨 [THUMBNAIL] S3 upload result:`, uploadResult);
          
const thumbUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_PROCESSED_BUCKET}/${thumbKey}`;
          console.log(`🎨 [THUMBNAIL] Thumbnail URL: ${thumbUrl}`);
          
          // Update database
          const updateResult = await prisma.video.update({
            where: { id: videoId },
            data: { thumbnailUrl: thumbUrl },
          });
          
          console.log(`🎨 [THUMBNAIL] Database updated with thumbnailUrl: ${updateResult.thumbnailUrl}`);
          console.log("✅ [THUMBNAIL] Thumbnail generated & uploaded successfully");
          
        } catch (thumbnailError) {
          console.error(`❌ [THUMBNAIL] Failed to generate/upload thumbnail:`, thumbnailError);
          console.error(`❌ [THUMBNAIL] Error stack:`, thumbnailError.stack);
          // Don't throw - continue processing without thumbnail
        }
      } else {
        console.log(`✅ [THUMBNAIL] Thumbnail already exists: ${currentVideo.thumbnailUrl}`);
      }

      // --------------------
      // EXTRACT DURATION WITH DETAILED LOGGING
      // --------------------
      console.log(`\n========== DURATION EXTRACTION START ==========`);
      
      try {
        videoDuration = await getVideoDuration(localInput);
        console.log(`🎯 [MAIN] Video duration captured: ${videoDuration}s`);
        console.log(`🎯 [MAIN] Duration type: ${typeof videoDuration}`);
        console.log(`🎯 [MAIN] Duration value check: ${videoDuration !== null && videoDuration !== undefined ? 'VALID' : 'INVALID'}`);
        
        // Update database with duration
        console.log(`💾 [DB] Updating database with duration: ${videoDuration}`);
        const updateResult = await prisma.video.update({
          where: { id: videoId },
          data: { duration: videoDuration },
        });
        console.log(`💾 [DB] Update result - duration field: ${updateResult.duration}`);
        
        // Verify the update
        const verifyVideo = await prisma.video.findUnique({
          where: { id: videoId },
          select: { id: true, duration: true }
        });
        console.log(`✅ [DB VERIFY] Duration in database after update: ${verifyVideo.duration}`);
        
      } catch (durationError) {
        console.error(`❌ [DURATION] Failed to extract duration:`, durationError);
        console.error(`❌ [DURATION] Error stack:`, durationError.stack);
        // Don't throw - continue processing without duration
        videoDuration = null;
      }
      
      console.log(`========== DURATION EXTRACTION END ==========\n`);

      // CREATE OUTPUT DIR
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // TRANSCODE (HLS)
      await prisma.video.update({
        where: { id: videoId },
        data: { processingStage: "TRANSCODE" },
      });

      console.log(`Transcoding video with FFmpeg...`);
      const ffmpegCommand = `ffmpeg -y -i "${localInput}" \
        -map 0:v -map 0:v \
        -c:v libx264 -crf 22 \
        -filter:v:0 scale=640:360 -maxrate:v:0 800k -bufsize:v:0 1200k \
        -filter:v:1 scale=1280:720 -maxrate:v:1 2800k -bufsize:v:1 4200k \
        -var_stream_map "v:0 v:1" \
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

      console.log(`Transcoding complete`);

      // UPLOAD PROCESSED FILES
      await prisma.video.update({
        where: { id: videoId },
        data: { processingStage: "UPLOAD" },
      });

      console.log(`Uploading HLS files to S3...`);
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

      console.log(`Uploaded ${files.length} files`);

      // UPDATE STATUS READY
      console.log(`\n========== FINAL UPDATE START ==========`);
      console.log(`📦 [FINAL] Duration value being set: ${videoDuration}`);
      console.log(`📦 [FINAL] Duration type: ${typeof videoDuration}`);
      
      const finalUpdate = await prisma.video.update({
        where: { id: videoId },
        data: {
          status: "READY",
          processingStage: "FINALIZE",
          visibility: "PUBLIC",
          masterPlaylist: `videos/${videoId}/master.m3u8`,
          duration: videoDuration,
        },
      });
      
      console.log(`📦 [FINAL] Final update result - duration: ${finalUpdate.duration}`);
      
      // Final verification
      const finalVerify = await prisma.video.findUnique({
        where: { id: videoId },
        select: { id: true, duration: true, status: true }
      });
      console.log(`✅ [FINAL VERIFY] Video in database:`, finalVerify);
      console.log(`========== FINAL UPDATE END ==========\n`);

      console.log(`Video ${videoId} READY with duration: ${videoDuration}s`);
    } catch (error) {
      console.error(`Processing failed for ${videoId}:`, error);
      // Check if video exists before updating
      try {
        const videoExists = await prisma.video.findUnique({
          where: { id: videoId },
        });
        if (videoExists) {
          await prisma.video.update({
            where: { id: videoId },
            data: {
              status: "PROCESSING_FAILED", // ✅ FIXED: Changed from "FAILED" to "PROCESSING_FAILED"
              errorMessage: error.message,
              processingAttempts: { increment: 1 },
              lastProcessedAt: new Date(),
            },
          });
        } else {
          console.error(`❌ Cannot update - video ${videoId} doesn't exist`);
        }
      } catch (updateError) {
        console.error(`❌ Error updating video status:`, updateError.message);
      }
      throw error;
    } finally {
      // --------------------
      // CLEANUP
      // --------------------
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
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
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Video processing worker started");