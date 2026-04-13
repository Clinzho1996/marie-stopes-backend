import Supplier from "../models/Supplier.js";

export const createSupplier = async (req, res) => {
	const supplier = await Supplier.create(req.body);
	res.json(supplier);
};

export const getSuppliers = async (req, res) => {
	const suppliers = await Supplier.find();
	res.json(suppliers);
};
