import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
	{
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Patient", // 🔹 Add this line
			required: true,
		},
		doctorName: String,
		items: [
			{
				drugId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Drug", // 🔹 Add this line (assuming your model is named "Drug")
					required: true,
				},
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
