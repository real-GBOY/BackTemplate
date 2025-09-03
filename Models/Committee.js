/** @format */

const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const committeeSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		members: [
			{
				type: Types.ObjectId,
				ref: "User",
			},
		],
		createdBy: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Validation: Ensure committee has at least one member
committeeSchema.pre("validate", function (next) {
	if (this.members && this.members.length === 0) {
		return next(new Error("Committee must have at least one member"));
	}
	next();
});

// Method to add member to committee
committeeSchema.methods.addMember = function (userId) {
	if (!this.members.includes(userId)) {
		this.members.push(userId);
		return this.save();
	}
	return Promise.resolve(this);
};

// Method to remove member from committee
committeeSchema.methods.removeMember = function (userId) {
	this.members = this.members.filter(
		(memberId) => memberId.toString() !== userId.toString()
	);
	return this.save();
};

// Method to check if user is member of committee
committeeSchema.methods.isMember = function (userId) {
	return this.members.some(
		(memberId) => memberId.toString() === userId.toString()
	);
};

// Indexes for better query performance
committeeSchema.index({ name: 1 }, { unique: true });
committeeSchema.index({ createdBy: 1, createdAt: -1 }); // committees by creator
committeeSchema.index({ isActive: 1, createdAt: -1 }); // active committees
committeeSchema.index({ members: 1 }); // committees by member

module.exports = mongoose.model("Committee", committeeSchema);
