import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		return res.status(400).json({ message: "Invalid credentials" });
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return res.status(400).json({ message: "Invalid credentials" });
	}

	res.json({
		user: {
			id: user._id,
			email: user.email,
			role: user.role,
		},
		token: generateToken(user),
	});
};
