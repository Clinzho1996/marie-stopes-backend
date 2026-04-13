import express from "express";
import { dashboardStats } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, dashboardStats);

export default router;
