const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    //2- if the user exists, compare the password they logged in and the one that exists and if they're the same
    //3- generate a token for them
    //4- if the user is admin, then add it to the token. because later
    // some routes will only be available to admin only. and we want to be able to tell that from the token
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(
        {
          userId: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1w" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "user authenticated",
        user: {
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Name, Email, and Password are required" });
    }
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      isAdmin,
    };

    if (req.file) {
      userData.profileImg = req.file.path;
    }

    user = new User(userData);

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1w" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  res.json({
    user: req.user,
  });
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ message: "Logged out" });
};

module.exports = { login, signup, getUser, logout };
