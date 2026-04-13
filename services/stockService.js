import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";

/**
 * 📥 Add stock (from purchases)
 */
export const addStock = async ({
	drugId,
	batchNumber,
	quantity,
	expiryDate,
	costPrice,
	sellingPrice,
	supplierId,
}) => {
	const batch = await Batch.create({
		drug: drugId,
		batchNumber,
		quantity,
		remainingQuantity: quantity,
		expiryDate,
		costPrice,
		sellingPrice,
		supplier: supplierId,
	});

	await InventoryLog.create({
		drug: drugId,
		batch: batch._id,
		type: "IN",
		quantity,
		note: "Stock added via purchase",
	});

	return batch;
};

/**
 * 📤 FIFO Dispensing Logic
 */
export const dispenseStock = async ({
	drugId,
	quantity,
	referenceId, // prescription or dispense ID
}) => {
	let remaining = quantity;

	// Get valid batches (FIFO + not expired)
	const batches = await Batch.find({
		drug: drugId,
		remainingQuantity: { $gt: 0 },
		expiryDate: { $gt: new Date() },
	}).sort({ expiryDate: 1, createdAt: 1 });

	if (!batches.length) {
		throw new Error("No stock available");
	}

	const usedBatches = [];

	for (let batch of batches) {
		if (remaining <= 0) break;

		const deduct = Math.min(batch.remainingQuantity, remaining);

		batch.remainingQuantity -= deduct;
		await batch.save();

		await InventoryLog.create({
			drug: drugId,
			batch: batch._id,
			type: "OUT",
			quantity: deduct,
			reference: referenceId,
			note: "Dispensed to patient",
		});

		usedBatches.push({
			batchId: batch._id,
			quantity: deduct,
		});

		remaining -= deduct;
	}

	if (remaining > 0) {
		throw new Error("Insufficient stock");
	}

	return usedBatches;
};

/**
 * 🔍 Check available stock
 */
export const checkStock = async (drugId) => {
	const batches = await Batch.find({
		drug: drugId,
		expiryDate: { $gt: new Date() },
	});

	const total = batches.reduce((acc, b) => acc + b.remainingQuantity, 0);

	return total;
};

/**
 * ⚖️ Manual Stock Adjustment
 */
export const adjustStock = async ({
	drugId,
	batchId,
	quantity,
	type, // IN or OUT
	reason,
}) => {
	const batch = await Batch.findById(batchId);

	if (!batch) throw new Error("Batch not found");

	if (type === "OUT" && batch.remainingQuantity < quantity) {
		throw new Error("Insufficient stock for adjustment");
	}

	if (type === "IN") {
		batch.remainingQuantity += quantity;
	} else {
		batch.remainingQuantity -= quantity;
	}

	await batch.save();

	await InventoryLog.create({
		drug: drugId,
		batch: batchId,
		type,
		quantity,
		note: reason || "Stock adjustment",
	});

	return batch;
};
