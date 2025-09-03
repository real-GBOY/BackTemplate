/** @format */

const express = require("express");
const router = express.Router();
const {
	createCommittee,
	getCommittees,
	getCommitteeById,
	updateCommittee,
	deleteCommittee,
	addMember,
	removeMember,
	getCommitteeMembers,
	getUserCommittees,
} = require("../Controllers/committeeController");
const {
	authenticateToken,
	requireRole,
} = require("../Middlewares/authMiddleware");

// Public routes
router.get("/", getCommittees);
router.get("/:id", getCommitteeById);
router.get("/:id/members", getCommitteeMembers);

// Protected routes (authenticated users only)
router.get("/user/my-committees", authenticateToken, getUserCommittees);

// Admin-only routes
router.post("/", authenticateToken, requireRole("admin"), createCommittee);
router.put("/:id", authenticateToken, requireRole("admin"), updateCommittee);
router.patch("/:id", authenticateToken, requireRole("admin"), updateCommittee);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteCommittee);

// Member management (admin only)
router.post("/:id/members", authenticateToken, requireRole("admin"), addMember);
router.delete(
	"/:id/members",
	authenticateToken,
	requireRole("admin"),
	removeMember
);

module.exports = router;
