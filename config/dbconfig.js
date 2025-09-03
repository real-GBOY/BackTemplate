/** @format */

const mongoose = require("mongoose");

const dbconnect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Database connected successfully");
	} catch (error) {
		console.error("Database connection failed:", error);
	}
};
module.exports = dbconnect;
