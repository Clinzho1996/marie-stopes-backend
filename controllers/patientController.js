import Patient from "../models/Patient.js";

// ✅ Create
export const createPatient = async (req, res) => {
	try {
		const patient = await Patient.create({
			...req.body,
			createdBy: req.user?.id, // optional tracking
		});

		res.status(201).json(patient);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Get All
export const getPatients = async (req, res) => {
	try {
		const patients = await Patient.find().sort({ createdAt: -1 });

		res.json(patients);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single
export const getPatient = async (req, res) => {
	try {
		const patient = await Patient.findById(req.params.id);

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		res.json(patient);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update
export const updatePatient = async (req, res) => {
	try {
		const patient = await Patient.findById(req.params.id);

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		Object.assign(patient, req.body);

		const updated = await patient.save();

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete
export const deletePatient = async (req, res) => {
	try {
		const patient = await Patient.findById(req.params.id);

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		await patient.deleteOne();

		res.json({ message: "Patient deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
