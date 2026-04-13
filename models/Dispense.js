import mongoose from "mongoose";

const dispenseSchema = new mongoose.Schema(
	{
		patientId: mongoose.Schema.Types.ObjectId,
		dispensedBy: mongoose.Schema.Types.ObjectId,
		items: [
			{
				drugId: mongoose.Schema.Types.ObjectId,
				batchId: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				price: Number,
			},
		],
		totalAmount: Number,
	},
	{ timestamps: true },
);

export default mongoose.model("Dispense", dispenseSchema);
