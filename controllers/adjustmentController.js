import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";
import StockAdjustment from "../models/StockAdjustment.js";

// ✅ Create Stock Adjustment (LOSS / DAMAGE / EXPIRED etc.)
export const adjustStock = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { batchId, quantity, reason, type } = req.body;

		const batch = await Batch.findById(batchId).session(session);

		if (!batch) {
			throw new Error("Batch not found");
		}

		if (quantity <= 0) {
			throw new Error("Quantity must be greater than 0");
		}

		if (batch.remainingQuantity < quantity) {
			throw new Error("Insufficient stock in batch");
		}

		// ✅ reduce safe field (NOT total quantity)
		batch.remainingQuantity -= quantity;
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
					quantity,
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
			.populate("drugId")
			.populate("batchId");

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

		// 🔁 reverse previous deduction
		batch.remainingQuantity += adj.quantity;

		// apply new deduction
		if (req.body.quantity > batch.remainingQuantity) {
			throw new Error("Insufficient stock for update");
		}

		batch.remainingQuantity -= req.body.quantity;

		await batch.save({ session });

		Object.assign(adj, req.body);
		const updated = await adj.save({ session });

		await session.commitTransaction();
		session.endSession();

		res.json(updated);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();

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

		// restore stock
		batch.remainingQuantity += adj.quantity;
		await batch.save({ session });

		await adj.deleteOne({ session });

		await session.commitTransaction();
		session.endSession();

		res.json({ message: "Adjustment deleted successfully" });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();

		res.status(400).json({ message: err.message });
	}
};