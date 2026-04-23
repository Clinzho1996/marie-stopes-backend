import Batch from "../models/Batch.js";
import Drug from "../models/Drug.js";

// ✅ Create Batch
export const createBatch = async (req, res) => {
	try {
		// optional validation: ensure drug exists
		const drugExists = await Drug.findById(req.body.drugId);

		if (!drugExists) {
			return res.status(404).json({ message: "Drug not found" });
		}

		const batch = await Batch.create({
			...req.body,
			createdBy: req.user?.id,
		});

		res.status(201).json(batch);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All Batches
export const getBatches = async (req, res) => {
	try {
		const batches = await Batch.find()
			.populate("drugId", "name category")
			.sort({ expiryDate: 1 }); // FEFO priority view

		res.json(batches);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single Batch
export const getBatch = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id).populate(
			"drugId",
			"name category",
		);

		if (!batch) {
			return res.status(404).json({ message: "Batch not found" });
		}

		res.json(batch);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update Batch
export const updateBatch = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id);

		if (!batch) {
			return res.status(404).json({ message: "Batch not found" });
		}

		Object.assign(batch, req.body);

		const updated = await batch.save();

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete Batch
export const deleteBatch = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id);

		if (!batch) {
			return res.status(404).json({ message: "Batch not found" });
		}

		// ⚠️ Prevent deleting if stock already partially used
		if (batch.remainingQuantity < batch.quantity) {
			return res.status(400).json({
				message: "Cannot delete batch with used stock",
			});
		}

		await batch.deleteOne();

		res.json({ message: "Batch deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
