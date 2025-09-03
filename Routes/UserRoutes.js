/** @format */

const express = require("express");
const router = express.Router();
const {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
} = require("../Controllers/userController");
const {
	authenticateToken,
	requireRole,
} = require("../Middlewares/authMiddleware");

// Admin-only routes for user management
router.get("/", authenticateToken, requireRole("admin"), getUsers);
router.get("/:id", authenticateToken, requireRole("admin"), getUserById);
router.post("/", authenticateToken, requireRole("admin"), createUser);
router.patch("/:id", authenticateToken, requireRole("admin"), updateUser);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteUser);

module.exports = router;
