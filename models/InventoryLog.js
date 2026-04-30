import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
	{
		drugId: mongoose.Schema.Types.ObjectId,
		batchId: mongoose.Schema.Types.ObjectId,
		type: {
			type: String,
			enum: [
				"purchase",
				"dispense",
				"loss",
				"gain",
				"damage",
				"correction",
				"adjustment",
			],
		},
		quantity: Number,
		reference: String,
		performedBy: mongoose.Schema.Types.ObjectId,
	},
	{ timestamps: true },
);

export default mongoose.model("InventoryLog", inventoryLogSchema);
