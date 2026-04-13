import express from "express";
import { adjustStock } from "../controllers/adjustmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adjustStock);

export default router;
