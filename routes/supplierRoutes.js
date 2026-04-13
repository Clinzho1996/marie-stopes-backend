import express from "express";
import {
	createSupplier,
	getSuppliers,
} from "../controllers/supplierController.js";

const router = express.Router();
router.post("/", createSupplier);
router.get("/", getSuppliers);

export default router;
