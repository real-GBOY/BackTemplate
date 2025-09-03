/** @format */

const { verifyToken, getTokenFromHeader } = require("../config/jwtConfig");
const User = require("../Models/User");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
	try {
		const token = getTokenFromHeader(req);

		if (!token) {
			return res.status(401).json({ message: "Access token required" });
		}

		const decoded = verifyToken(token);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res
				.status(401)
				.json({ message: "Invalid token - user not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		return res
			.status(500)
			.json({ message: "Authentication error", error: error.message });
	}
};

// Middleware to check if user has specific role (legacy support)
const requireRole = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: "Authentication required" });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: "Insufficient permissions",
				required: roles,
				current: req.user.role,
			});
		}

		next();
	};
};

// Middleware to check if user has specific permission
const requirePermission = (...permissions) => {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({ message: "Authentication required" });
			}

			// Populate user role with permissions
			await req.user.populate({
				path: "role",
				populate: {
					path: "permissions",
					select: "key",
				},
			});

			if (!req.user.role) {
				return res.status(403).json({ message: "User has no role assigned" });
			}

			const userPermissions = req.user.role.permissions.map((p) => p.key);
			const hasPermission = permissions.some((permission) =>
				userPermissions.includes(permission)
			);

			if (!hasPermission) {
				return res.status(403).json({
					message: "Insufficient permissions",
					required: permissions,
					userPermissions: userPermissions,
				});
			}

			next();
		} catch (error) {
			return res.status(500).json({
				message: "Permission check error",
				error: error.message,
			});
		}
	};
};

// Middleware to check if user has any of the specified permissions
const requireAnyPermission = (...permissions) => {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({ message: "Authentication required" });
			}

			// Populate user role with permissions
			await req.user.populate({
				path: "role",
				populate: {
					path: "permissions",
					select: "key",
				},
			});

			if (!req.user.role) {
				return res.status(403).json({ message: "User has no role assigned" });
			}

			const userPermissions = req.user.role.permissions.map((p) => p.key);
			const hasAnyPermission = permissions.some((permission) =>
				userPermissions.includes(permission)
			);

			if (!hasAnyPermission) {
				return res.status(403).json({
					message: "Insufficient permissions",
					required: permissions,
					userPermissions: userPermissions,
				});
			}

			next();
		} catch (error) {
			return res.status(500).json({
				message: "Permission check error",
				error: error.message,
			});
		}
	};
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ message: "Authentication required" });
	}

	if (!req.user.isVerified) {
		return res.status(403).json({ message: "Account verification required" });
	}

	next();
};

module.exports = {
	authenticateToken,
	requireRole,
	requirePermission,
	requireAnyPermission,
	requireVerification,
};
