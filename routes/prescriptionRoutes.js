import express from "express";
import {
	createPrescription,
	getPrescriptions,
} from "../controllers/prescriptionController.js";

const router = express.Router();
router.post("/", createPrescription);
router.get("/", getPrescriptions);

export default router;
