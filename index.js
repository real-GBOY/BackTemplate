/** @format */

const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cors = require("cors");
const dbconnect = require("./config/dbconfig");
const authRoutes = require("./Routes/AuthRoutes");
const userRoutes = require("./Routes/UserRoutes");
const candidateRoutes = require("./Routes/CandidateRoutes");
const voteRoutes = require("./Routes/VoteRoutes");
const electionRoutes = require("./Routes/ElectionRoutes");
const committeeRoutes = require("./Routes/CommitteeRoutes");

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/committees", committeeRoutes);

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
