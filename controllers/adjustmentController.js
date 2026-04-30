// controllers/adjustmentController.js
import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";
import StockAdjustment from "../models/StockAdjustment.js";

// ✅ Create Stock Adjustment (LOSS / DAMAGE / GAIN etc.)
export const adjustStock = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { batchId, quantity, reason, type } = req.body;

		console.log(`Processing adjustment - Type: ${type}, Quantity: ${quantity}`);

		const batch = await Batch.findById(batchId).session(session);

		if (!batch) {
			throw new Error("Batch not found");
		}

		if (quantity <= 0) {
			throw new Error("Quantity must be greater than 0");
		}

		// Handle different adjustment types
		if (type === "gain") {
			// ✅ For GAIN: Add to remaining quantity
			batch.remainingQuantity += quantity;
			console.log(
				`Gain adjustment: Adding ${quantity} to stock. New quantity: ${batch.remainingQuantity}`,
			);
		} else {
			// For LOSS, DAMAGE, etc.: Subtract from remaining quantity
			if (batch.remainingQuantity < quantity) {
				throw new Error("Insufficient stock in batch");
			}
			batch.remainingQuantity -= quantity;
			console.log(
				`Loss/Damage adjustment: Subtracting ${quantity} from stock. New quantity: ${batch.remainingQuantity}`,
			);
		}

		await batch.save({ session });

		// ✅ create adjustment record
		const adj = await StockAdjustment.create(
			[
				{
					batchId,
					drugId: batch.drugId,
					quantity,
					type: type || "loss",
					reason,
					adjustedBy: req.user.id,
				},
			],
			{ session },
		);

		// ✅ inventory log (audit trail)
		await InventoryLog.create(
			[
				{
					drugId: batch.drugId,
					batchId,
					type: type || "loss",
					quantity: type === "gain" ? quantity : -quantity, // Negative for losses, positive for gains
					reference: adj[0]._id,
					performedBy: req.user.id,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		session.endSession();

		res.status(201).json(adj[0]);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		console.error("Adjustment error:", err);
		res.status(400).json({ message: err.message });
	}
};

export const getAdjustments = async (req, res) => {
	try {
		const adjustments = await StockAdjustment.find()
			.populate("drugId", "name")
			.populate("batchId", "batchNumber")
			.sort({ createdAt: -1 });

		res.json(adjustments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const getAdjustment = async (req, res) => {
	try {
		const adjustment = await StockAdjustment.findById(req.params.id)
			.populate("drugId", "name")
			.populate("batchId", "batchNumber");

		if (!adjustment) {
			return res.status(404).json({ message: "Adjustment not found" });
		}

		res.json(adjustment);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const updateAdjustment = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const adj = await StockAdjustment.findById(req.params.id).session(session);

		if (!adj) {
			throw new Error("Adjustment not found");
		}

		const batch = await Batch.findById(adj.batchId).session(session);

		// 🔁 Reverse previous adjustment
		if (adj.type === "gain") {
			// If it was a gain, subtract what we added
			batch.remainingQuantity -= adj.quantity;
		} else {
			// If it was a loss/damage, add back what we removed
			batch.remainingQuantity += adj.quantity;
		}

		// Apply new adjustment
		if (req.body.type === "gain") {
			batch.remainingQuantity += req.body.quantity;
		} else {
			if (batch.remainingQuantity < req.body.quantity) {
				throw new Error("Insufficient stock for update");
			}
			batch.remainingQuantity -= req.body.quantity;
		}

		await batch.save({ session });

		Object.assign(adj, req.body);
		const updated = await adj.save({ session });

		await session.commitTransaction();
		session.endSession();

		res.json(updated);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		console.error("Update adjustment error:", err);
		res.status(400).json({ message: err.message });
	}
};

export const deleteAdjustment = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const adj = await StockAdjustment.findById(req.params.id).session(session);

		if (!adj) {
			throw new Error("Adjustment not found");
		}

		const batch = await Batch.findById(adj.batchId).session(session);

		// Reverse the adjustment
		if (adj.type === "gain") {
			// If it was a gain, subtract what we added
			batch.remainingQuantity -= adj.quantity;
		} else {
			// If it was a loss/damage, add back what we removed
			batch.remainingQuantity += adj.quantity;
		}

		await batch.save({ session });
		await adj.deleteOne({ session });

		await session.commitTransaction();
		session.endSession();

		res.json({ message: "Adjustment deleted successfully" });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		console.error("Delete adjustment error:", err);
		res.status(400).json({ message: err.message });
	}
};
