/** @format */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const permissionSchema = new Schema(
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
		category: {
			type: String,
			required: true,
			enum: [
				"election_management",
				"user_management",
				"committee_management",
				"candidate_management",
				"vote_management",
				"dashboard_access",
				"system_settings",
				"committee_specific",
			],
		},
	},
	{ timestamps: true }
);

// Indexes for better query performance
permissionSchema.index({ key: 1 }, { unique: true });
permissionSchema.index({ category: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
