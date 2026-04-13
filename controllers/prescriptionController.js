import Prescription from "../models/Prescription.js";

export const createPrescription = async (req, res) => {
	const pres = await Prescription.create(req.body);
	res.json(pres);
};

export const getPrescriptions = async (req, res) => {
	const pres = await Prescription.find();
	res.json(pres);
};
