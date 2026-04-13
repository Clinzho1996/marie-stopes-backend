import express from "express";
import { createBatch, getBatches } from "../controllers/batchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBatch);
router.get("/", protect, getBatches);

export default router;
