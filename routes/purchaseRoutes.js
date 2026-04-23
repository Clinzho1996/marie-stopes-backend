import express from "express";
import {
	createPO,
	getPO,
	getPOs,
	receivePO,
} from "../controllers/purchaseController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPO);
router.get("/", protect, getPOs);
router.get("/:id", protect, getPO);
router.patch("/:id/receive", protect, receivePO);

export default router;
