import express from "express";
import {
	createSupplier,
	deleteSupplier,
	getSupplier,
	getSuppliers,
	updateSupplier,
} from "../controllers/supplierController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createSupplier);
router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);

export default router;
