import Patient from "../models/Patient.js";

export const createPatient = async (req, res) => {
	const patient = await Patient.create(req.body);
	res.json(patient);
};

export const getPatients = async (req, res) => {
	const patients = await Patient.find();
	res.json(patients);
};
