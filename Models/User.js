/** @format */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: "Role",
			required: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		committeeId: {
			type: Schema.Types.ObjectId,
			ref: "Committee",
			required: false, // Optional - users can exist without committee
		},
	},
	{ timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified("password")) return next();

	try {
		// Hash password with cost of 12
		const hashedPassword = await bcrypt.hash(this.password, 12);
		this.password = hashedPassword;
		next();
	} catch (error) {
		next(error);
	}
});

// Helper method for verifying password
userSchema.methods.verifyPassword = async function verifyPassword(
	plainPassword
) {
	return await bcrypt.compare(plainPassword, this.password);
};

// Method to change password
userSchema.methods.changePassword = async function (newPassword) {
	this.password = newPassword;
	return await this.save();
};

// Virtual for password confirmation (useful in forms)
userSchema
	.virtual("confirmPassword")
	.get(function () {
		return this._confirmPassword;
	})
	.set(function (value) {
		this._confirmPassword = value;
	});

// Validate password confirmation
userSchema.pre("validate", function (next) {
	if (this._confirmPassword && this._confirmPassword !== this.password) {
		this.invalidate("confirmPassword", "Password confirmation does not match");
	}
	next();
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isVerified: 1 }); // users by role and verification status
userSchema.index({ isVerified: 1, createdAt: -1 }); // verification tracking
userSchema.index({ committeeId: 1 }); // users by committee
userSchema.index({ committeeId: 1, role: 1 }); // committee members by role

module.exports = mongoose.model("User", userSchema);
