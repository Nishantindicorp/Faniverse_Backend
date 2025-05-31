const User = require("../models/User");
const UserSyncService = require("../services/userSync.service");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    await UserSyncService.syncUserToPostgres(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { username, password } = req.body;
  // console.log("Updating user with ID:", userId);
  const userId = req.params?.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    // const userId = req.user.id;
    if (password) user.password = password;

    await user.save();

    await UserSyncService.syncUserToPostgres(user);

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        postgresId: user.postgresId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.verifyToken = (req, res) => {
  res.json({ user: req.user });
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        postgresId: user.postgresId,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
