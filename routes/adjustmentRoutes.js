import express from "express";
import {
	adjustStock,
	deleteAdjustment,
	getAdjustment,
	getAdjustments,
	updateAdjustment,
} from "../controllers/adjustmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adjustStock);
router.get("/", protect, getAdjustments);
router.get("/:id", protect, getAdjustment);
router.put("/:id", protect, updateAdjustment);
router.delete("/:id", protect, deleteAdjustment);

export default router;
