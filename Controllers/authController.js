/** @format */

const User = require("../Models/User");
const Role = require("../Models/Role");
const { generateToken, generateRefreshToken } = require("../config/jwtConfig");

// Register/Signup user
exports.signup = async (req, res) => {
	try {
		const { email, password, role } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: "email already exists" });
		}

		// Create new user (unverified by default)
		const user = await User.create({
			email,
			password,
			role: role || "member",
			isVerified: false, // Always false for new signups
		});

		// Return user data without password (no token generated)
		const userData = user.toObject();
		delete userData.password;

		return res.status(201).json({
			message:
				"User registered successfully. Please wait for admin verification.",
			user: userData,
		});
	} catch (err) {
		if (err && err.code === 11000) {
			return res.status(409).json({ message: "email already exists" });
		}
		return res
			.status(500)
			.json({ message: "failed to register user", error: err.message });
	}
};

// Login user
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}

		// Find user by email and include password field
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Verify password (no hashing as requested)
		const isPasswordValid = await user.verifyPassword(password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Check if user is verified (only verified users can login)
		if (!user.isVerified) {
			return res.status(403).json({
				message: "Account not verified. Please wait for admin verification.",
			});
		}

		// Generate access token and refresh token
		const accessToken = generateToken({
			userId: user._id,
			email: user.email,
			role: user.role,
		});

		const refreshToken = generateRefreshToken({
			userId: user._id,
			email: user.email,
			role: user.role,
		});

		// Return user data without password
		const userData = user.toObject();
		delete userData.password;

		return res.json({
			message: "Login successful",
			accessToken,
			refreshToken,
			user: userData,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Login failed", error: err.message });
	}
};

// Get current user profile (protected route)
exports.getProfile = async (req, res) => {
	try {
		// User is already attached to req by authMiddleware
		const userData = req.user.toObject();
		delete userData.password;
		return res.json(userData);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch user profile", error: err.message });
	}
};

// Refresh token (using refresh token to get new access token)
exports.refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({
				message: "Refresh token is required",
			});
		}

		// Verify the refresh token
		const { verifyToken } = require("../config/jwtConfig");
		const decoded = verifyToken(refreshToken);

		// Find user by ID from refresh token
		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(401).json({
				message: "Invalid refresh token - user not found",
			});
		}

		// Check if user is still verified
		if (!user.isVerified) {
			return res.status(403).json({
				message: "User account is not verified",
			});
		}

		// Generate new access token
		const newAccessToken = generateToken({
			userId: user._id,
			email: user.email,
			role: user.role,
		});

		// Generate new refresh token
		const newRefreshToken = generateRefreshToken({
			userId: user._id,
			email: user.email,
			role: user.role,
		});

		return res.json({
			message: "Tokens refreshed successfully",
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		});
	} catch (err) {
		if (err.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid refresh token" });
		}
		if (err.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Refresh token expired" });
		}
		return res
			.status(500)
			.json({ message: "Failed to refresh token", error: err.message });
	}
};

// Logout (client-side token removal - server doesn't store tokens)
exports.logout = async (req, res) => {
	try {
		// Since we're using stateless JWT, logout is handled client-side
		// This endpoint is mainly for consistency and potential future enhancements
		return res.json({
			message: "Logout successful - please remove token from client",
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Logout failed", error: err.message });
	}
};

// Verify user (admin only)
exports.verifyUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isVerified } = req.body;

		if (typeof isVerified !== "boolean") {
			return res.status(400).json({
				message: "isVerified must be a boolean value",
			});
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{ isVerified },
			{ new: true, runValidators: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return user data without password
		const userData = user.toObject();
		delete userData.password;

		return res.json({
			message: `User ${isVerified ? "verified" : "unverified"} successfully`,
			user: userData,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to verify user", error: err.message });
	}
};

// Get unverified users (admin only)
exports.getUnverifiedUsers = async (req, res) => {
	try {
		const unverifiedUsers = await User.find({ isVerified: false });

		// Remove passwords from response
		const usersData = unverifiedUsers.map((user) => {
			const userData = user.toObject();
			delete userData.password;
			return userData;
		});

		return res.json({
			message: "Unverified users retrieved successfully",
			users: usersData,
			count: usersData.length,
		});
	} catch (err) {
		return res.status(500).json({
			message: "Failed to fetch unverified users",
			error: err.message,
		});
	}
};

// Get user permissions (for frontend dashboard)
exports.getUserPermissions = async (req, res) => {
	try {
		// Populate user role with permissions
		await req.user.populate({
			path: "role",
			populate: {
				path: "permissions",
				select: "key name description category",
			},
		});

		if (!req.user.role) {
			return res.status(404).json({
				message: "User has no role assigned",
			});
		}

		// Format permissions for frontend
		const permissions = req.user.role.permissions.map((permission) => ({
			key: permission.key,
			name: permission.name,
			description: permission.description,
			category: permission.category,
		}));

		// Group permissions by category for easier frontend handling
		const permissionsByCategory = permissions.reduce((acc, permission) => {
			if (!acc[permission.category]) {
				acc[permission.category] = [];
			}
			acc[permission.category].push(permission);
			return acc;
		}, {});

		return res.json({
			message: "User permissions retrieved successfully",
			user: {
				id: req.user._id,
				email: req.user.email,
				isVerified: req.user.isVerified,
				role: {
					key: req.user.role.key,
					name: req.user.role.name,
					description: req.user.role.description,
				},
			},
			permissions: permissions,
			permissionsByCategory: permissionsByCategory,
			permissionKeys: permissions.map((p) => p.key), // Simple array for easy checking
		});
	} catch (err) {
		return res.status(500).json({
			message: "Failed to fetch user permissions",
			error: err.message,
		});
	}
};
