import express from "express";
const router = new express.Router();

import { protect } from "../../middleware/authMiddleware.js";
import { handleClockIn, handleClockOut } from "./attendController.js";

router.post("/clockin", protect, handleClockIn);
router.post("/clockout", protect, handleClockOut);

export default router;
