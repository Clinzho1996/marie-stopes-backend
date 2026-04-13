import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: String,
		email: { type: String, unique: true },
		password: String,
		role: {
			type: String,
			enum: ["admin", "pharmacist"],
			default: "pharmacist",
		},
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.model("User", userSchema);
