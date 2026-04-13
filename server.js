import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./config/env.js";

connectDB();

app.listen(5000, () => {
	console.log("Server running on port 5000");
});
