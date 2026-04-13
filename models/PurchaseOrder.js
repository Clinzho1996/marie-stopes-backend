import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
	{
		supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
		items: [
			{
				drugId: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				costPrice: Number,
				batchNumber: String,
				expiryDate: Date,
			},
		],
		status: {
			type: String,
			enum: ["pending", "received"],
			default: "pending",
		},
		totalAmount: Number,
		receivedAt: Date,
	},
	{ timestamps: true },
);

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
