import Batch from "../models/Batch.js";

export const createBatch = async (req, res) => {
	const batch = await Batch.create(req.body);
	res.json(batch);
};

export const getBatches = async (req, res) => {
	res.json(await Batch.find());
};
