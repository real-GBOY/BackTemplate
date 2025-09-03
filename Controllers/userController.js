/** @format */

const User = require("../Models/User");

// Create user (no hashing as requested)
exports.createUser = async (req, res) => {
	try {
		const { email, password, role, isVerified } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}
		const user = await User.create({
			email,
			password,
			role: role || "member",
			isVerified: Boolean(isVerified) || false,
		});
		return res.status(201).json(user);
	} catch (err) {
		if (err && err.code === 11000) {
			return res.status(409).json({ message: "email already exists" });
		}
		return res
			.status(500)
			.json({ message: "failed to create user", error: err.message });
	}
};

// Get all users
exports.getUsers = async (_req, res) => {
	try {
		const users = await User.find();
		return res.json(users);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to fetch users", error: err.message });
	}
};

// Get single user by id
exports.getUserById = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: "user not found" });
		return res.json(user);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to fetch user", error: err.message });
	}
};

// Update user
exports.updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { email, password, role, isVerified } = req.body;
		const update = {};
		if (email !== undefined) update.email = email;
		if (password !== undefined) update.password = password; // no hashing
		if (role !== undefined) update.role = role;
		if (isVerified !== undefined) update.isVerified = isVerified;
		const user = await User.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		});
		if (!user) return res.status(404).json({ message: "user not found" });
		return res.json(user);
	} catch (err) {
		if (err && err.code === 11000) {
			return res.status(409).json({ message: "email already exists" });
		}
		return res
			.status(500)
			.json({ message: "failed to update user", error: err.message });
	}
};

// Delete user
exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findByIdAndDelete(id);
		if (!user) return res.status(404).json({ message: "user not found" });
		return res.json({ message: "user deleted" });
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to delete user", error: err.message });
	}
};
