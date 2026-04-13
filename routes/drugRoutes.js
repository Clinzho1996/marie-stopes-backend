import express from "express";
import { createDrug, getDrugs } from "../controllers/drugController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createDrug);
router.get("/", protect, getDrugs);

export default router;
