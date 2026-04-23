import express from "express";
import {
	createPrescription,
	deletePrescription,
	getPrescription,
	getPrescriptions,
	updatePrescription,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPrescription);
router.get("/", protect, getPrescriptions);
router.get("/:id", protect, getPrescription);
router.put("/:id", protect, updatePrescription);
router.delete("/:id", protect, deletePrescription);

export default router;
