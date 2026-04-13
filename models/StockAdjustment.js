import mongoose from "mongoose";

const adjustmentSchema = new mongoose.Schema(
	{
		drugId: mongoose.Schema.Types.ObjectId,
		batchId: mongoose.Schema.Types.ObjectId,
		quantity: Number,
		reason: String,
		type: { type: String, enum: ["loss", "correction"] },
		adjustedBy: mongoose.Schema.Types.ObjectId,
	},
	{ timestamps: true },
);

export default mongoose.model("StockAdjustment", adjustmentSchema);
