const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  getUser,
  logout,
} = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/signup", upload.single("profileImg"), signup);

router.get("/me", authMiddleware, getUser);
router.post("/logout", logout);

module.exports = router;
