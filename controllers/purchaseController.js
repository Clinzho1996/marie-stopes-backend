import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

export const createPO = async (req, res) => {
	const po = await PurchaseOrder.create(req.body);
	res.json(po);
};

export const receivePO = async (req, res) => {
	const po = await PurchaseOrder.findById(req.params.id);

	for (let item of po.items) {
		const batch = await Batch.create({
			drugId: item.drugId,
			batchNumber: item.batchNumber,
			quantity: item.quantity,
			costPrice: item.costPrice,
			expiryDate: item.expiryDate,
		});

		await InventoryLog.create({
			drugId: item.drugId,
			batchId: batch._id,
			type: "purchase",
			quantity: item.quantity,
			reference: po._id,
			performedBy: req.user.id,
		});
	}

	po.status = "received";
	po.receivedAt = new Date();
	await po.save();

	res.json(po);
};
