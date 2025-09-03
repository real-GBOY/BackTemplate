/** @format */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const roleSchema = new Schema(
	{
		key: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		permissions: [
			{
				type: Schema.Types.ObjectId,
				ref: "Permission",
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Indexes for better query performance
roleSchema.index({ key: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });

module.exports = mongoose.model("Role", roleSchema);
