import Prescription from "../models/Prescription.js";

// ✅ Create
export const createPrescription = async (req, res) => {
	try {
		const prescription = await Prescription.create({
			...req.body,
			createdBy: req.user?.id, // optional if you track users
		});

		res.status(201).json(prescription);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All
export const getPrescriptions = async (req, res) => {
	try {
		const prescriptions = await Prescription.find()
			.populate("patientId", "fullName phone gender")
			// ❌ REMOVE THIS LINE: .populate("createdBy", "name email")
			.sort({ createdAt: -1 });

		res.json(prescriptions);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single
export const getPrescription = async (req, res) => {
	try {
		const prescription = await Prescription.findById(req.params.id).populate(
			"patientId",
			"fullName phone gender",
		);
		// ❌ REMOVE THIS LINE: .populate("createdBy", "name email")

		if (!prescription) {
			return res.status(404).json({ message: "Prescription not found" });
		}

		res.json(prescription);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update
export const updatePrescription = async (req, res) => {
	try {
		const prescription = await Prescription.findById(req.params.id);

		if (!prescription) {
			return res.status(404).json({ message: "Prescription not found" });
		}

		Object.assign(prescription, req.body);

		const updated = await prescription.save();

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete
export const deletePrescription = async (req, res) => {
	try {
		const prescription = await Prescription.findById(req.params.id);

		if (!prescription) {
			return res.status(404).json({ message: "Prescription not found" });
		}

		await prescription.deleteOne();

		res.json({ message: "Prescription deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
