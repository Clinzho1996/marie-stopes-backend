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

export const dispenseStock = async ({ items, referenceId }) => {
	const results = [];

	for (const item of items) {
		let remaining = item.quantity;

		const batches = await Batch.find({
			drugId: item.drugId,
			remainingQuantity: { $gt: 0 },
			expiryDate: { $gt: new Date() },
		}).sort({ expiryDate: 1, createdAt: 1 });

		if (!batches.length) {
			throw new Error(`No stock for drug ${item.drugId}`);
		}

		for (let batch of batches) {
			if (remaining <= 0) break;

			const deduct = Math.min(batch.remainingQuantity, remaining);

			batch.remainingQuantity -= deduct;
			await batch.save();

			await InventoryLog.create({
				drug: item.drugId,
				batch: batch._id,
				type: "dispense",
				quantity: deduct,
				reference: referenceId,
				note: "Dispensed to patient",
			});

			remaining -= deduct;
		}

		if (remaining > 0) {
			throw new Error(`Insufficient stock for drug ${item.drugId}`);
		}

		results.push({ drugId: item.drugId, quantity: item.quantity });
	}

	return results;
};
