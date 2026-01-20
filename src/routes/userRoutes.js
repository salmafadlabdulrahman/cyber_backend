const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const { getUsers } = require("../controllers/userController");

router.get("/", authMiddleware, adminMiddleware, getUsers);
// router.get("/:id", getUserById);
// router.delete("/:id", deleteUser);

module.exports = router;
