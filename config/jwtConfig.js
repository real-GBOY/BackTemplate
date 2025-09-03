/** @format */

const jwt = require("jsonwebtoken");

// JWT Configuration - All values must be provided via environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

// Validate required environment variables
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is required");
}
if (!JWT_EXPIRES_IN) {
	throw new Error("JWT_EXPIRES_IN environment variable is required");
}
if (!JWT_REFRESH_EXPIRES_IN) {
	throw new Error("JWT_REFRESH_EXPIRES_IN environment variable is required");
}

// Generate JWT token
const generateToken = (payload) => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
};

// Generate refresh token
const generateRefreshToken = (payload) => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRES_IN,
	});
};

// Verify JWT token
const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		throw error;
	}
};

// Decode token without verification (for getting payload)
const decodeToken = (token) => {
	return jwt.decode(token);
};

// Get token from request headers
const getTokenFromHeader = (req) => {
	const authHeader = req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}
	return authHeader.replace("Bearer ", "");
};

module.exports = {
	JWT_SECRET,
	JWT_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN,
	generateToken,
	generateRefreshToken,
	verifyToken,
	decodeToken,
	getTokenFromHeader,
};
