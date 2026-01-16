require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { initializeWebSocket } = require("./websocket");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/video.routes");
const feedRoutes = require("./routes/feed.routes");
const app = express();

// IMPORTANT: Create HTTP server BEFORE initializing WebSocket
const server = http.createServer(app);

// Configure CORS
app.use(cors());

// Enable JSON parsing
app.use(express.json());

// Initialize WebSocket (must be after server creation)
initializeWebSocket(server);

// Routes
app.use("/api", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/feed", feedRoutes);
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;

// CRITICAL: Use server.listen, not app.listen (for WebSocket)
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});