import Batch from "../models/Batch.js";
import Dispense from "../models/Dispense.js";
import Drug from "../models/Drug.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";

export const dashboardStats = async (req, res) => {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	// 📦 STOCK ANALYTICS
	const stockAgg = await Batch.aggregate([
		{
			$group: {
				_id: null,
				totalStock: { $sum: "$quantity" },
				totalRemaining: { $sum: "$remainingQuantity" },
			},
		},
	]);

	// 💉 DISPENSE ANALYTICS
	const totalDispensed = await Dispense.countDocuments();

	const monthlyDispensed = await Dispense.countDocuments({
		createdAt: { $gte: startOfMonth },
	});

	// 👥 USER ANALYTICS
	const totalUsers = await User.countDocuments();

	const userRoles = await User.aggregate([
		{
			$group: {
				_id: "$role",
				count: { $sum: 1 },
			},
		},
	]);

	// 🧑‍⚕️ PATIENT ANALYTICS
	const totalPatients = await Patient.countDocuments();

	const newPatients = await Patient.countDocuments({
		createdAt: { $gte: startOfMonth },
	});

	// 💊 DRUG ANALYTICS
	const totalDrugs = await Drug.countDocuments();

	// 📊 FINAL RESPONSE
	res.json({
		inventory: {
			totalStock: stockAgg[0]?.totalStock || 0,
			totalRemainingStock: stockAgg[0]?.totalRemaining || 0,
		},

		dispensing: {
			totalDispensed,
			monthlyDispensed,
		},

		users: {
			totalUsers,
			roles: userRoles,
		},

		patients: {
			totalPatients,
			newPatientsThisMonth: newPatients,
		},

		drugs: {
			totalDrugs,
		},
	});
};
