import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ✅ Get All Users
export const getUsers = async (req, res) => {
	try {
		const users = await User.find().select("-password");
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Get Single User
export const getUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Create User
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
			createdBy: req.user?.id,
		});

		user.password = undefined;

		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ✅ Update User
export const updateUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const { password, ...rest } = req.body;

		// update normal fields
		Object.assign(user, rest);

		// update password only if provided
		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}

		const updated = await user.save();

		updated.password = undefined;

		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await user.deleteOne();

		res.json({ message: "User deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
