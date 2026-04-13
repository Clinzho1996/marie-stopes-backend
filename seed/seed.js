import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import "../config/env.js";
import User from "../models/User.js";

await connectDB();

const users = [
	{ email: "admin@mssl-demo.com", password: "123456", role: "admin" },
	{ email: "pharmacist@mssl-demo.com", password: "123456", role: "pharmacist" },
];

const hashedUsers = await Promise.all(
	users.map(async (u) => ({
		...u,
		password: await bcrypt.hash(u.password, 10),
	})),
);

await User.insertMany(hashedUsers);

console.log("Seeded");
process.exit();
