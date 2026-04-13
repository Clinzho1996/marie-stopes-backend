import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
	{
		patientId: mongoose.Schema.Types.ObjectId,
		doctorName: String,
		items: [
			{
				drugId: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				dosage: String,
			},
		],
		status: {
			type: String,
			enum: ["pending", "dispensed"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

export default mongoose.model("Prescription", prescriptionSchema);
