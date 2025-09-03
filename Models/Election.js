/** @format */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const ELECTION_TYPES = ["board", "president"];
const ELECTION_STATUS = ["draft", "active", "closed"];

const electionSchema = new Schema(
	{
		electionType: {
			type: String,
			enum: ELECTION_TYPES,
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ELECTION_STATUS,
			default: "draft",
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		committeeId: {
			type: Schema.Types.ObjectId,
			ref: "Committee",
			required: false, // Required only for board elections
		},
	},
	{ timestamps: true }
);

// Validation: endDate must be after startDate and committee requirements
electionSchema.pre("validate", async function (next) {
	try {
		if (this.endDate <= this.startDate) {
			return next(new Error("End date must be after start date"));
		}

		// For board elections, committeeId is required
		if (this.electionType === "board") {
			if (!this.committeeId) {
				return next(new Error("Committee is required for board elections"));
			}

			// Validate committee exists and is active
			const Committee = mongoose.model("Committee");
			const committee = await Committee.findById(this.committeeId);
			if (!committee || !committee.isActive) {
				return next(new Error("Committee not found or inactive"));
			}
		}

		// For president elections, committeeId should not be set
		if (this.electionType === "president" && this.committeeId) {
			return next(
				new Error("President elections cannot be linked to a committee")
			);
		}

		next();
	} catch (error) {
		next(error);
	}
});

// Indexes for efficient queries
electionSchema.index({ electionType: 1, status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ status: 1, startDate: 1, endDate: 1 }); // active elections query
electionSchema.index({ createdBy: 1, createdAt: -1 }); // elections by creator
electionSchema.index({ electionType: 1, createdAt: -1 }); // elections by type
electionSchema.index({ committeeId: 1, electionType: 1 }); // elections by committee and type
electionSchema.index({ committeeId: 1, status: 1 }); // active elections by committee

module.exports = mongoose.model("Election", electionSchema);
