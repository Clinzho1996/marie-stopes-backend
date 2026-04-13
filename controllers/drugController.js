import Drug from "../models/Drug.js";

export const createDrug = async (req, res) => {
	const drug = await Drug.create(req.body);
	res.json(drug);
};

export const getDrugs = async (req, res) => {
	res.json(await Drug.find());
};
