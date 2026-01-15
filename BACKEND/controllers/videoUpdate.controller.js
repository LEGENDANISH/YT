const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const updateVideo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, visibility, scheduledAt } = req.body;

  const video = await prisma.video.findUnique({ where: { id } });

  if (!video || video.userId !== userId) {
    return res.status(404).json({ message: "Video not found" });
  }

  await prisma.video.update({
    where: { id },
    data: {
      title,
      description,
      visibility,
      scheduledAt,
    },
  });

  res.json({ message: "Video updated" });
};

module.exports = { updateVideo };
