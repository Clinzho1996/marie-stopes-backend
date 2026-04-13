import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";
import StockAdjustment from "../models/StockAdjustment.js";

export const adjustStock = async (req, res) => {
	const { batchId, quantity } = req.body;

	const batch = await Batch.findById(batchId);

	batch.quantity -= quantity;
	await batch.save();

	const adj = await StockAdjustment.create({
		...req.body,
		adjustedBy: req.user.id,
	});

	await InventoryLog.create({
		drugId: batch.drugId,
		batchId,
		type: "loss",
		quantity,
		reference: adj._id,
		performedBy: req.user.id,
	});

	res.json(adj);
};
