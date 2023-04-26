const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/Login", loginUser);

// Me Route
router.get("/me", protect, getMe);


module.exports = router;
