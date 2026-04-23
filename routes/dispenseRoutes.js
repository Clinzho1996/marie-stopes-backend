import express from "express";
import {
	createDispense,
	deleteDispense,
	getDispense,
	getDispenses,
	updateDispense,
} from "../controllers/dispenseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", protect, createDispense);

// Read
router.get("/", protect, getDispenses); // Get all
router.get("/:id", protect, getDispense); // Get single

// Update
router.put("/:id", protect, updateDispense);
// or router.patch("/:id", protect, updateDispense);

// Delete
router.delete("/:id", protect, deleteDispense);

export default router;
