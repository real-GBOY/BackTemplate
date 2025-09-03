/** @format */

const express = require("express");
const router = express.Router();
const {
	castVote,
	getElectionResults,
	getAllVotes,
	getUserVotes,
} = require("../Controllers/voteController");
const {
	authenticateToken,
	requireRole,
	requireVerification,
} = require("../Middlewares/authMiddleware");

// Cast a vote (authenticated + verified users only)
router.post("/", authenticateToken, requireVerification, castVote);

// Get election results (public - can be restricted to admin if needed)
router.get("/results/:electionType", getElectionResults);

// Get specific election results
router.get("/results/president", getElectionResults);
router.get("/results/board", getElectionResults);

// Get all votes (admin only)
router.get("/", authenticateToken, requireRole("admin"), getAllVotes);

// Get user's own votes (authenticated users only)
router.get("/my-votes", authenticateToken, getUserVotes);

module.exports = router;
