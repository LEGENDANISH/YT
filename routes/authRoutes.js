const express = require("express");
const { registerUser, loginUser, updateUser, deleteUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");


const router = express.Router();

// routes/authRoutes.js
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", protect, updateUser);
router.delete("/delete", protect, deleteUser);


module.exports = router;