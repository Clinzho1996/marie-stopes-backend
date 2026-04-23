import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import Dispense from "../models/Dispense.js";
import InventoryLog from "../models/InventoryLog.js";

export const createDispense = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		await dispenseStock({
			items: req.body.items,
			referenceId: req.body.prescriptionId || req.body.dispenseId,
			session,
		});

		const dispense = await Dispense.create(
			[
				{
					...req.body,
					dispensedBy: req.user.id,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		session.endSession();

		res.json(dispense[0]);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		res.status(400).json({ message: err.message });
	}
};

export const dispenseStock = async ({ items, referenceId, session }) => {
	const results = [];

	for (const item of items) {
		let remaining = item.quantity;

		const batches = await Batch.find({
			drugId: item.drugId,
			remainingQuantity: { $gt: 0 },
			expiryDate: { $gt: new Date() },
		})
			.sort({ expiryDate: 1, createdAt: 1 })
			.session(session);

		if (!batches.length) {
			throw new Error(`No stock for drug ${item.drugId}`);
		}

		for (let batch of batches) {
			if (remaining <= 0) break;

			const deduct = Math.min(batch.remainingQuantity, remaining);

			batch.remainingQuantity -= deduct;
			await batch.save({ session });

			await InventoryLog.create(
				[
					{
						drug: item.drugId,
						batch: batch._id,
						type: "dispense",
						quantity: deduct,
						reference: referenceId,
						note: "Dispensed to patient",
					},
				],
				{ session },
			);

			remaining -= deduct;
		}

		if (remaining > 0) {
			throw new Error(`Insufficient stock for drug ${item.drugId}`);
		}

		results.push({ drugId: item.drugId, quantity: item.quantity });
	}

	return results;
};

export const getDispenses = async (req, res) => {
	try {
		const dispenses = await Dispense.find()
			.populate("dispensedBy", "name email")
			.sort({ createdAt: -1 });

		res.json(dispenses);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const getDispense = async (req, res) => {
	try {
		const dispense = await Dispense.findById(req.params.id).populate(
			"dispensedBy",
			"name email",
		);

		if (!dispense) {
			return res.status(404).json({ message: "Dispense not found" });
		}

		res.json(dispense);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
const restoreStock = async (referenceId, session) => {
	const logs = await InventoryLog.find({
		reference: referenceId,
		type: "dispense",
	}).session(session);

	for (const log of logs) {
		const batch = await Batch.findById(log.batch).session(session);
		if (!batch) continue;

		batch.remainingQuantity += log.quantity;
		await batch.save({ session });
	}

	await InventoryLog.deleteMany({
		reference: referenceId,
		type: "dispense",
	}).session(session);
};

export const updateDispense = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const dispense = await Dispense.findById(req.params.id).session(session);

		if (!dispense) {
			throw new Error("Dispense not found");
		}

		const referenceId = dispense.prescriptionId || dispense._id;

		// Restore previous stock
		await restoreStock(referenceId, session);

		// Apply new stock deduction
		await dispenseStock({
			items: req.body.items,
			referenceId,
			session,
		});

		// Update record
		Object.assign(dispense, req.body);
		await dispense.save({ session });

		await session.commitTransaction();
		session.endSession();

		res.json(dispense);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		res.status(400).json({ message: err.message });
	}
};

export const deleteDispense = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const dispense = await Dispense.findById(req.params.id).session(session);

		if (!dispense) {
			throw new Error("Dispense not found");
		}

		const referenceId = dispense.prescriptionId || dispense._id;

		// Restore stock
		await restoreStock(referenceId, session);

		// Delete dispense record
		await dispense.deleteOne({ session });

		await session.commitTransaction();
		session.endSession();

		res.json({ message: "Dispense deleted successfully" });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		res.status(400).json({ message: err.message });
	}
};
