const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // if (!user) {
    //   return res.status(400).json({ message: "user can't be found" });
    // }

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
        { expiresIn: "1w" }
      );

      res.status(200).json({
        message: "user authenticated",
        email: user.email,
        token: token,
      });
    } else {
      res.status(400).json({ mesage: "Invalid Email or Password" });
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
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res
        .status(400)
        .json({ message: "Name, Email, and Password are required" });
    }
    let user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const userData = {
      name,
      email: req.body.email.toLowerCase(),
      password: bcrypt.hashSync(req.body.password, 10),
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
      { expiresIn: "1w" }
    );

    return res
      .status(201)
      .json({ message: "Account created successfully", token: token });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

module.exports = { login, signup };
