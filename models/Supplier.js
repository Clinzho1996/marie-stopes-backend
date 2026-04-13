import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
	{
		name: String,
		contactPerson: String,
		phone: String,
		email: String,
		address: String,
	},
	{ timestamps: true },
);

export default mongoose.model("Supplier", supplierSchema);
