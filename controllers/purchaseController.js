import Batch from "../models/Batch.js";
import InventoryLog from "../models/InventoryLog.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

// ✅ Create Purchase Order
export const createPO = async (req, res) => {
	try {
		const po = await PurchaseOrder.create({
			...req.body,
			createdBy: req.user?.id,
			status: "pending",
		});

		res.status(201).json(po);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All Purchase Orders
// controllers/purchaseController.js

// ✅ Get All Purchase Orders
export const getPOs = async (req, res) => {
	try {
		const pos = await PurchaseOrder.find()
			.populate("supplierId", "name") // Changed from "supplier" to "supplierId"
			.sort({ createdAt: -1 });

		res.json(pos);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single PO
export const getPO = async (req, res) => {
	try {
		const po = await PurchaseOrder.findById(req.params.id)
			.populate("supplierId", "name") // Changed from "supplier" to "supplierId"
			.populate("createdBy", "name");

		if (!po) {
			return res.status(404).json({ message: "Purchase Order not found" });
		}

		res.json(po);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const receivePO = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const po = await PurchaseOrder.findById(req.params.id).session(session);

		if (!po) {
			throw new Error("Purchase Order not found");
		}

		if (po.status === "received") {
			throw new Error("Purchase Order already received");
		}

		for (let item of po.items) {
			const batch = await Batch.create(
				[
					{
						drugId: item.drugId,
						batchNumber: item.batchNumber,
						quantity: item.quantity,
						remainingQuantity: item.quantity,
						costPrice: item.costPrice,
						expiryDate: item.expiryDate,
						supplier: po.supplier,
						createdBy: req.user.id,
					},
				],
				{ session },
			);

			await InventoryLog.create(
				[
					{
						drugId: item.drugId,
						batchId: batch[0]._id,
						type: "purchase",
						quantity: item.quantity,
						reference: po._id,
						performedBy: req.user.id,
					},
				],
				{ session },
			);
		}

		po.status = "received";
		po.receivedAt = new Date();

		await po.save({ session });

		await session.commitTransaction();
		session.endSession();

		res.json(po);
	} catch (err) {
		await session.abortTransaction();
		session.endSession();

		res.status(400).json({ message: err.message });
	}
};
