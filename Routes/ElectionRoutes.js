/** @format */

const express = require("express");
const router = express.Router();
const {
	createElection,
	getElections,
	getElectionById,
	updateElection,
	deleteElection,
	startElection,
	closeElection,
	getActiveElections,
} = require("../Controllers/electionController");
const {
	authenticateToken,
	requireRole,
} = require("../Middlewares/authMiddleware");

// Public routes
router.get("/", getElections);
router.get("/active", getActiveElections);
router.get("/:id", getElectionById);

// Admin-only routes
router.post("/", authenticateToken, requireRole("admin"), createElection);

router.patch("/:id", authenticateToken, requireRole("admin"), updateElection);

router.delete("/:id", authenticateToken, requireRole("admin"), deleteElection);

router.patch(
	"/:id/start",
	authenticateToken,
	requireRole("admin"),
	startElection
);

router.patch(
	"/:id/close",
	authenticateToken,
	requireRole("admin"),
	closeElection
);

module.exports = router;
