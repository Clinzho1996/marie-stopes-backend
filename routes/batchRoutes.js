import express from "express";
import {
	createBatch,
	deleteBatch,
	getBatch,
	getBatches,
	updateBatch,
} from "../controllers/batchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBatch);
router.get("/", protect, getBatches);
router.get("/:id", protect, getBatch);
router.put("/:id", protect, updateBatch);
router.delete("/:id", protect, deleteBatch);

export default router;
