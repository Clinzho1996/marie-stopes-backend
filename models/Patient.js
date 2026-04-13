import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
	{
		fullName: String,
		phone: String,
		gender: String,
	},
	{ timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
