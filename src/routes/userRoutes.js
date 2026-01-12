const express = require("express");
const router = express.Router();

const { getUsers } = require("../controllers/userController");

router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.delete("/:id", deleteUser);

module.exports = router;
