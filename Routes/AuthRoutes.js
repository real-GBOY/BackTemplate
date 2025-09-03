/** @format */

const express = require("express");
const router = express.Router();
const {
	signup,
	login,
	getProfile,
	refreshToken,
	logout,
	verifyUser,
	getUnverifiedUsers,
	getUserPermissions,
} = require("../Controllers/authController");
const {
	authenticateToken,
	requireRole,
} = require("../Middlewares/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

// Admin-only routes
router.get(
	"/unverified",
	authenticateToken,
	requireRole("admin"),
	getUnverifiedUsers
);
router.patch(
	"/verify/:userId",
	authenticateToken,
	requireRole("admin"),
	verifyUser
);

// Get user permissions (for frontend dashboard)
router.get("/permissions", authenticateToken, getUserPermissions);

module.exports = router;
