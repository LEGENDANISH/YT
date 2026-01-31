const express = require("express");

const router = express.Router();

const multer = require("multer");
const upload = multer();

router.put("/thumbnail/:videoId", authMiddleware, upload.single("thumbnail"), updateThumbnail);
router.delete("/thumbnail/:videoId", authMiddleware, async (req, res) => {
  await prisma.video.update({
    where: { id: req.params.videoId },
    data: { thumbnailUrl: null },
  });

  res.json({ message: "Thumbnail removed" });
});


module.exports = router;