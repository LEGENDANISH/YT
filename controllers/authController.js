const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client"); // adjust path if needed


const registerUser = async (req, res) => {
  try {
    const { email, username, password, displayName } = req.body;

    // Validate
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "Email or username already in use",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        channelBanner: user.channelBanner,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const updateUser = async (req, res) => {
  try {
    const { displayName, bio, avatarUrl, channelBanner } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName,
        bio,
        avatarUrl,
        channelBanner,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        channelBanner: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports={registerUser,loginUser,updateUser,deleteUser};