import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
	{
		drugId: { type: mongoose.Schema.Types.ObjectId, ref: "Drug" },
		batchNumber: String,
		quantity: Number,
		remainingQuantity: {
			type: Number,
			required: true,
			default: function () {
				return this.quantity;
			},
		},
		costPrice: Number,
		sellingPrice: Number,
		expiryDate: Date,
	},
	{ timestamps: true },
);

export default mongoose.model("Batch", batchSchema);
