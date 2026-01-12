const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "No users found", success: false });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find user",
      error: error.message,
    });
  }
};

module.exports = { getUsers };
