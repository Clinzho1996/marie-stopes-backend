import express from "express";
import {
	createPatient,
	deletePatient,
	getPatient,
	getPatients,
	updatePatient,
} from "../controllers/patientController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPatient);
router.get("/", protect, getPatients);
router.get("/:id", protect, getPatient);
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);

export default router;
