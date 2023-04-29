import express from "express";
const router = new express.Router();

import {
  handleCreateUser,
  handleUserLogin,
  handleUserLogout,
  handleGetLoggedInUserProfile,
} from "./userController.js";
import { protect } from "../../middleware/authMiddleware.js";

router.post("/register", handleCreateUser);
router.post("/login", handleUserLogin);
router.get("/logout", protect, handleUserLogout);
router.get("/users/me", protect, handleGetLoggedInUserProfile);

export default router;
