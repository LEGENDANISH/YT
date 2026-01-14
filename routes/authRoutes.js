const express = require("express");
const { registerUser, loginUser, updateUser, deleteUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/signup",registerUser)
router.post("/signin",loginUser)
router.put("/update",protect,updateUser)
router.delete("/delete",protect,deleteUser)

module.exports = router;