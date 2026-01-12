const express = require("express");
const router = express.Router();

const { login, signup } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

router.post("/login", login);
router.post("/signup", upload.single("profileImg"), signup);

module.exports = router;
