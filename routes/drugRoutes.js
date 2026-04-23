import express from "express";
import {
	createDrug,
	deleteDrug,
	getDrug,
	getDrugs,
	updateDrug,
} from "../controllers/drugController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createDrug);
router.get("/", protect, getDrugs);
router.get("/:id", protect, getDrug);
router.put("/:id", protect, updateDrug);
router.delete("/:id", protect, deleteDrug);

export default router;
