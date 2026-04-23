import PurchaseOrder from "../models/PurchaseOrder.js";
import Supplier from "../models/Supplier.js";

// ✅ Create Supplier
export const createSupplier = async (req, res) => {
	try {
		const supplier = await Supplier.create({
			...req.body,
			createdBy: req.user?.id,
		});

		res.status(201).json(supplier);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All Suppliers
export const getSuppliers = async (req, res) => {
	try {
		const suppliers = await Supplier.find().sort({ createdAt: -1 });

		res.json(suppliers);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single Supplier
export const getSupplier = async (req, res) => {
	try {
		const supplier = await Supplier.findById(req.params.id);

		if (!supplier) {
			return res.status(404).json({ message: "Supplier not found" });
		}

		res.json(supplier);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update Supplier
export const updateSupplier = async (req, res) => {
	try {
		const supplier = await Supplier.findById(req.params.id);

		if (!supplier) {
			return res.status(404).json({ message: "Supplier not found" });
		}

		Object.assign(supplier, req.body);

		const updated = await supplier.save();

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete Supplier
export const deleteSupplier = async (req, res) => {
	try {
		const supplier = await Supplier.findById(req.params.id);

		if (!supplier) {
			return res.status(404).json({ message: "Supplier not found" });
		}

		// ⚠️ Prevent deletion if supplier has purchase history
		const hasPOs = await PurchaseOrder.exists({
			supplier: supplier._id,
		});

		if (hasPOs) {
			return res.status(400).json({
				message: "Cannot delete supplier with purchase history",
			});
		}

		await supplier.deleteOne();

		res.json({ message: "Supplier deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
