import Batch from "../models/Batch.js";
import Drug from "../models/Drug.js";

// ✅ Create
export const createDrug = async (req, res) => {
	try {
		const drug = await Drug.create({
			...req.body,
			createdBy: req.user?.id, // optional
		});

		res.status(201).json(drug);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All
export const getDrugs = async (req, res) => {
	try {
		const drugs = await Drug.find().sort({ createdAt: -1 });
		res.json(drugs);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single
export const getDrug = async (req, res) => {
	try {
		const drug = await Drug.findById(req.params.id);

		if (!drug) {
			return res.status(404).json({ message: "Drug not found" });
		}

		res.json(drug);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update
export const updateDrug = async (req, res) => {
	try {
		const drug = await Drug.findById(req.params.id);

		if (!drug) {
			return res.status(404).json({ message: "Drug not found" });
		}

		Object.assign(drug, req.body);

		const updated = await drug.save();

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete
export const deleteDrug = async (req, res) => {
	try {
		const drug = await Drug.findById(req.params.id);

		if (!drug) {
			return res.status(404).json({ message: "Drug not found" });
		}

		// ⚠️ Prevent deletion if batches exist
		const hasBatches = await Batch.exists({ drugId: drug._id });

		if (hasBatches) {
			return res.status(400).json({
				message: "Cannot delete drug with existing batches",
			});
		}

		await drug.deleteOne();

		res.json({ message: "Drug deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
