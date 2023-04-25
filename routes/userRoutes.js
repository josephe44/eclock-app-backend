const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/Login", loginUser);

module.exports = router;
