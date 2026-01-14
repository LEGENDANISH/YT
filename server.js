require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

connectDB();
const app = express();

app.use(express.json()); // Enable JSON parsing

app.use("/api/v1",authRoutes)

app.listen(8000,()=>{
    console.log("server is running on port 8000")
});




