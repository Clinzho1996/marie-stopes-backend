import express from "express";

import adjustmentRoutes from "./adjustmentRoutes.js";
import authRoutes from "./authRoutes.js";
import batchRoutes from "./batchRoutes.js";
import dispenseRoutes from "./dispenseRoutes.js";
import drugRoutes from "./drugRoutes.js";
import patientRoutes from "./patientRoutes.js";
import prescriptionRoutes from "./prescriptionRoutes.js";
import purchaseRoutes from "./purchaseRoutes.js";
import reportRoutes from "./reportRoutes.js";
import supplierRoutes from "./supplierRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// Auth
router.use("/auth", authRoutes);

// Users & Roles
router.use("/users", userRoutes);

// Core Pharmacy Modules
router.use("/drugs", drugRoutes);
router.use("/batches", batchRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);

// Patient Care
router.use("/patients", patientRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/dispense", dispenseRoutes);

// Inventory Control
router.use("/adjustments", adjustmentRoutes);

// Reports
router.use("/reports", reportRoutes);

export default router;
