import express from "express";
import { createDispense } from "../controllers/dispenseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createDispense);

export default router;
