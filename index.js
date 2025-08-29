/** @format */

const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cors = require("cors");
const dbconnect = require("./config/dbconfig");

dbconnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		credentials: true,
	})
);




app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
