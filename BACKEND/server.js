require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { initializeWebSocket } = require("./websocket");
const authRoutes = require("./modules/auth/routes/authRoutes");
const videoRoutes = require("./modules/video/routes/video.routes");
const subscriptionRoutes = require("./modules/subscription/routes/subscription.routes");
const feedRoutes = require("./modules/feed/routes/feed.routes");
const recommendationRoutes = require("./modules/recommendation/routes/recommendation.routes"); 

const cron = require("node-cron");
const axios = require("axios");

const app = express();

//  Create HTTP server
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Initialize WebSocket 
initializeWebSocket(server);

// Routes
app.use("/api", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/feed", feedRoutes);
// console.log("DATABASE_URL =", process.env.DATABASE_URL);
app.use("/api", subscriptionRoutes);
app.use("/api/search", require("./modules/search/routes/search.routes"));
app.use("/api", recommendationRoutes);
app.use("/api", require("./modules/thumbnail/routes/thumbnail.routes"));
app.use("/api/analytics", require("./modules/analytics/routes/analytics.routes"));
// check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});

// Ping self every 14 minutes to prevent Render sleep
cron.schedule("*/14 * * * *", async () => {
  try {
    await axios.get(`${process.env.BACKEND_URL}/health`);
    console.log("Self ping successful");
  } catch (err) {
    console.log("Self ping failed:", err.message);
  }
});