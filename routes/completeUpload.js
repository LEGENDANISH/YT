import { PrismaClient } from "@prisma/client";
import { videoQueue } from "../queues/videoQueue.js";

const prisma = new PrismaClient();

export const completeUpload = async (req, res) => {
  const { videoId } = req.body;

  await prisma.video.update({
    where: { id: videoId },
    data: { status: "PROCESSING" },
  });

  // enqueue processing job
  await videoQueue.add("process-video", { videoId });

  res.json({ message: "Processing started" });
};
