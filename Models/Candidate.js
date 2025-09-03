/** @format */

const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const CANDIDATE_TYPES = ["board", "president"];
const CANDIDATE_STATUS = ["active", "withdrawn"];

const candidateSchema = new Schema(
	{
		userId: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		electionId: {
			type: Types.ObjectId,
			ref: "Election",
			required: true,
		},
		candidateType: {
			type: String,
			enum: CANDIDATE_TYPES,
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: CANDIDATE_STATUS,
			default: "active",
		},
		committeeId: {
			type: Types.ObjectId,
			ref: "Committee",
			required: false, // Required only for board candidates
		},
	},
	{ timestamps: true }
);

// Validation: candidateType must match election type and committee requirements
candidateSchema.pre("validate", async function (next) {
	try {
		if (this.electionId) {
			const Election = mongoose.model("Election");
			const User = mongoose.model("User");
			const Committee = mongoose.model("Committee");

			const [election, user] = await Promise.all([
				Election.findById(this.electionId),
				User.findById(this.userId),
			]);

			if (election && election.electionType !== this.candidateType) {
				return next(new Error("Candidate type must match election type"));
			}

			// For board candidates, committeeId is required
			if (this.candidateType === "board") {
				if (!this.committeeId) {
					return next(new Error("Committee is required for board candidates"));
				}

				// Validate committee exists and is active
				const committee = await Committee.findById(this.committeeId);
				if (!committee || !committee.isActive) {
					return next(new Error("Committee not found or inactive"));
				}

				// Validate user is member of the committee
				if (!committee.isMember(this.userId)) {
					return next(
						new Error(
							"User must be a member of the committee to run as board candidate"
						)
					);
				}

				// Validate election is for the same committee
				if (
					election.committeeId &&
					election.committeeId.toString() !== this.committeeId.toString()
				) {
					return next(
						new Error("Candidate committee must match election committee")
					);
				}
			}

			// For president candidates, committeeId should not be set
			if (this.candidateType === "president" && this.committeeId) {
				return next(
					new Error("President candidates cannot belong to a committee")
				);
			}
		}
		next();
	} catch (error) {
		next(error);
	}
});

// Indexes for better query performance
candidateSchema.index({ electionId: 1, candidateType: 1 });
candidateSchema.index({ userId: 1, electionId: 1 }, { unique: true }); // one user per election
candidateSchema.index({ electionId: 1, status: 1 });
candidateSchema.index({ committeeId: 1, candidateType: 1 }); // candidates by committee and type
candidateSchema.index({ committeeId: 1, status: 1 }); // active candidates by committee

module.exports = mongoose.model("Candidate", candidateSchema);
