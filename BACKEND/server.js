require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { initializeWebSocket } = require("./websocket");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/video.routes");
const feedRoutes = require("./routes/feed.routes");
const app = express();

//  Create HTTP server BEFORE WebSocket
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Initialize WebSocket 
initializeWebSocket(server);

// Routes
app.use("/api", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/feed", feedRoutes);
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