import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getUsers = async (req, res) => {
	const users = await User.find().select("-password");
	res.json(users);
};

export const createUser = async (req, res) => {
	try {
		const { password, ...rest } = req.body;

		if (!password) {
			return res.status(400).json({ message: "Password is required" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			...rest,
			password: hashedPassword,
		});

		// remove password from response
		user.password = undefined;

		res.json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
