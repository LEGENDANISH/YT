require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/video.routes");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing

app.use("/api",authRoutes);
app.use("/api/videos", videoRoutes);

app.listen(8000,()=>{
    console.log("server is running on port 8000")
});




