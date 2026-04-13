import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
	{
		name: String,
		category: String,
		sku: String,
		unit: String,
		reorderLevel: Number,
		description: String,
	},
	{ timestamps: true },
);

export default mongoose.model("Drug", drugSchema);
