/** @format */

const express = require("express");
const router = express.Router();
const {
	createCandidate,
	getCandidates,
	getCandidateById,
	updateCandidate,
	deleteCandidate,
} = require("../Controllers/candidateController");
const {
	authenticateToken,
	requireRole,
} = require("../Middlewares/authMiddleware");

// Public routes (candidates can be viewed by anyone)
router.get("/", getCandidates);
router.get("/:id", getCandidateById);

// Protected routes (authentication required)
router.post(
	"/",
	authenticateToken,
	requireRole("member", "boardCandidate", "presidentCandidate"),
	createCandidate
);
router.put("/:id", authenticateToken, requireRole("admin"), updateCandidate);
router.patch("/:id", authenticateToken, requireRole("admin"), updateCandidate);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteCandidate);

module.exports = router;
