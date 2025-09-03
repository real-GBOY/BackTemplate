/** @format */

const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const ELECTION_TYPES = ["board", "president"];
const BOARD_CHOICES = ["yes", "no"];

const voteSchema = new Schema(
	{
		electionId: {
			type: Types.ObjectId,
			ref: "Election",
			required: true,
		},
		memberId: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		candidateId: {
			type: Types.ObjectId,
			ref: "Candidate",
			required: true,
		},
		electionType: {
			type: String,
			enum: ELECTION_TYPES,
			required: true,
		},
		boardChoice: {
			type: String,
			enum: BOARD_CHOICES,
			required: false,
		},
	},
	{ timestamps: true }
);

// Comprehensive validation for votes including committee membership
voteSchema.pre("validate", async function (next) {
	try {
		// Get election, candidate, and user data
		const Election = mongoose.model("Election");
		const Candidate = mongoose.model("Candidate");
		const User = mongoose.model("User");
		const Committee = mongoose.model("Committee");

		const [election, candidate, voter] = await Promise.all([
			Election.findById(this.electionId),
			Candidate.findById(this.candidateId),
			User.findById(this.memberId),
		]);

		// Validate election exists and is active
		if (!election) {
			return next(new Error("Election not found"));
		}

		if (election.status !== "active") {
			return next(new Error("Cannot vote in inactive election"));
		}

		// Validate candidate exists and belongs to this election
		if (!candidate) {
			return next(new Error("Candidate not found"));
		}

		if (candidate.electionId.toString() !== this.electionId.toString()) {
			return next(new Error("Candidate does not belong to this election"));
		}

		// Validate candidate type matches election type
		if (candidate.candidateType !== election.electionType) {
			return next(new Error("Candidate type does not match election type"));
		}

		// Validate candidate is active
		if (candidate.status !== "active") {
			return next(new Error("Cannot vote for inactive candidate"));
		}

		// Validate voter exists and is verified
		if (!voter) {
			return next(new Error("Voter not found"));
		}

		if (!voter.isVerified) {
			return next(new Error("Only verified users can vote"));
		}

		// For board elections, validate committee membership
		if (election.electionType === "board") {
			if (!this.boardChoice || !BOARD_CHOICES.includes(this.boardChoice)) {
				return next(
					new Error(
						"boardChoice is required and must be yes|no for board election"
					)
				);
			}

			// Validate election has committee
			if (!election.committeeId) {
				return next(new Error("Board election must be linked to a committee"));
			}

			// Validate voter is member of the committee
			const committee = await Committee.findById(election.committeeId);
			if (!committee || !committee.isActive) {
				return next(new Error("Committee not found or inactive"));
			}

			if (!committee.isMember(this.memberId)) {
				return next(
					new Error("Only committee members can vote in board elections")
				);
			}

			// Validate candidate belongs to the same committee
			if (
				!candidate.committeeId ||
				candidate.committeeId.toString() !== election.committeeId.toString()
			) {
				return next(
					new Error(
						"Candidate must belong to the same committee as the election"
					)
				);
			}
		}

		// For president elections, no committee restrictions
		if (election.electionType === "president") {
			if (this.boardChoice) {
				return next(
					new Error("boardChoice is not allowed for president elections")
				);
			}
		}

		next();
	} catch (error) {
		next(error);
	}
});

// Indexes for better query performance and data integrity
voteSchema.index({ electionId: 1, memberId: 1 }, { unique: true }); // one vote per member per election
voteSchema.index({ electionId: 1, candidateId: 1 }); // votes per candidate per election
voteSchema.index({ memberId: 1, createdAt: -1 }); // member voting history
voteSchema.index({ electionId: 1, createdAt: -1 }); // election voting timeline
voteSchema.index({ electionType: 1, electionId: 1 }); // election type and ID for results queries
voteSchema.index(
	{ electionId: 1, memberId: 1, candidateId: 1 },
	{ unique: true }
); // board vote uniqueness

module.exports = mongoose.model("Vote", voteSchema);
