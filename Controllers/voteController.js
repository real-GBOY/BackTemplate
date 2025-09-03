/** @format */

const Vote = require("../Models/Vote");
const Election = require("../Models/Election");
const Candidate = require("../Models/Candidate");

// Cast a vote
exports.castVote = async (req, res) => {
	try {
		const { electionType, candidateId, boardChoice } = req.body;
		const memberId = req.user._id;
		const now = new Date();

		// Validate required fields
		if (!electionType || !candidateId) {
			return res.status(400).json({
				message: "electionType and candidateId are required",
			});
		}

		// Validate election type
		if (!["board", "president"].includes(electionType)) {
			return res.status(400).json({
				message: "electionType must be 'board' or 'president'",
			});
		}

		// Check if election is active and within voting period
		const activeElection = await Election.findOne({
			electionType,
			status: "active",
			startDate: { $lte: now },
			endDate: { $gte: now },
		});

		if (!activeElection) {
			return res.status(400).json({
				message:
					"No active election found for this type or voting period has ended",
			});
		}

		// Verify candidate exists, is active, and belongs to this election
		const candidate = await Candidate.findOne({
			_id: candidateId,
			electionId: activeElection._id,
			candidateType: electionType,
			status: "active",
		});

		if (!candidate) {
			return res.status(404).json({
				message:
					"Candidate not found, not active, or does not belong to this election",
			});
		}

		// Check for existing votes based on election type
		if (electionType === "president") {
			// One vote per member for president election
			const existingVote = await Vote.findOne({
				electionId: activeElection._id,
				memberId,
			});

			if (existingVote) {
				return res.status(409).json({
					message: "You have already voted in this president election",
				});
			}
		} else if (electionType === "board") {
			// One vote per member per board candidate
			if (!boardChoice || !["yes", "no"].includes(boardChoice)) {
				return res.status(400).json({
					message:
						"boardChoice is required and must be 'yes' or 'no' for board election",
				});
			}

			const existingVote = await Vote.findOne({
				electionId: activeElection._id,
				memberId,
				candidateId,
			});

			if (existingVote) {
				return res.status(409).json({
					message: "You have already voted for this board candidate",
				});
			}
		}

		// Create the vote
		const vote = await Vote.create({
			electionId: activeElection._id,
			electionType,
			memberId,
			candidateId,
			boardChoice: electionType === "board" ? boardChoice : undefined,
		});

		return res.status(201).json({
			message: "Vote cast successfully",
			vote,
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({
				message: "Duplicate vote detected - you have already voted",
			});
		}
		return res
			.status(500)
			.json({ message: "Failed to cast vote", error: err.message });
	}
};

// Get election results (aggregated)
exports.getElectionResults = async (req, res) => {
	try {
		const { electionType } = req.params;

		if (!electionType || !["board", "president"].includes(electionType)) {
			return res.status(400).json({
				message: "Valid electionType (board or president) is required",
			});
		}

		// Check if there's an active or closed election
		const election = await Election.findOne({
			electionType,
			status: { $in: ["active", "closed"] },
		});

		if (!election) {
			return res.status(404).json({
				message: "No election found for this type",
			});
		}

		if (electionType === "president") {
			// President election results
			const results = await Vote.aggregate([
				{
					$match: {
						electionId: election._id,
						electionType: "president",
					},
				},
				{
					$lookup: {
						from: "candidates",
						localField: "candidateId",
						foreignField: "_id",
						as: "candidate",
					},
				},
				{
					$unwind: "$candidate",
				},
				{
					$group: {
						_id: "$candidateId",
						candidateName: { $first: "$candidate.name" },
						totalVotes: { $sum: 1 },
					},
				},
				{
					$sort: { totalVotes: -1 },
				},
			]);

			// Calculate total votes and percentages
			const totalVotes = results.reduce(
				(sum, result) => sum + result.totalVotes,
				0
			);

			const resultsWithPercentages = results.map((result) => ({
				candidateId: result._id,
				candidateName: result.candidateName,
				totalVotes: result.totalVotes,
				percentage:
					totalVotes > 0
						? Number(((result.totalVotes / totalVotes) * 100).toFixed(2))
						: 0,
			}));

			return res.json({
				electionType: "president",
				election: {
					_id: election._id,
					title: election.title,
					status: election.status,
					startDate: election.startDate,
					endDate: election.endDate,
				},
				totalVotes,
				results: resultsWithPercentages,
			});
		} else if (electionType === "board") {
			// Board election results
			const results = await Vote.aggregate([
				{
					$match: {
						electionId: election._id,
						electionType: "board",
					},
				},
				{
					$lookup: {
						from: "candidates",
						localField: "candidateId",
						foreignField: "_id",
						as: "candidate",
					},
				},
				{
					$unwind: "$candidate",
				},
				{
					$group: {
						_id: "$candidateId",
						candidateName: { $first: "$candidate.name" },
						totalVotes: { $sum: 1 },
						yesVotes: {
							$sum: {
								$cond: [{ $eq: ["$boardChoice", "yes"] }, 1, 0],
							},
						},
						noVotes: {
							$sum: {
								$cond: [{ $eq: ["$boardChoice", "no"] }, 1, 0],
							},
						},
					},
				},
				{
					$addFields: {
						yesPercentage: {
							$cond: {
								if: { $gt: ["$totalVotes", 0] },
								then: {
									$multiply: [{ $divide: ["$yesVotes", "$totalVotes"] }, 100],
								},
								else: 0,
							},
						},
						noPercentage: {
							$cond: {
								if: { $gt: ["$totalVotes", 0] },
								then: {
									$multiply: [{ $divide: ["$noVotes", "$totalVotes"] }, 100],
								},
								else: 0,
							},
						},
					},
				},
				{
					$sort: { totalVotes: -1 },
				},
			]);

			const totalBoardVotes = results.reduce(
				(sum, result) => sum + result.totalVotes,
				0
			);

			const resultsWithPercentages = results.map((result) => ({
				candidateId: result._id,
				candidateName: result.candidateName,
				totalVotes: result.totalVotes,
				yesVotes: result.yesVotes,
				noVotes: result.noVotes,
				yesPercentage: Number(result.yesPercentage.toFixed(2)),
				noPercentage: Number(result.noPercentage.toFixed(2)),
			}));

			return res.json({
				electionType: "board",
				election: {
					_id: election._id,
					title: election.title,
					status: election.status,
					startDate: election.startDate,
					endDate: election.endDate,
				},
				totalVotes: totalBoardVotes,
				results: resultsWithPercentages,
			});
		}
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to get election results", error: err.message });
	}
};

// Get all votes (admin only)
exports.getAllVotes = async (req, res) => {
	try {
		const { electionType, candidateId } = req.query;

		const filter = {};
		if (electionType) filter.electionType = electionType;
		if (candidateId) filter.candidateId = candidateId;

		const votes = await Vote.find(filter)
			.populate("memberId", "email role")
			.populate("candidateId", "name candidateType");

		return res.json({
			message: "Votes retrieved successfully",
			votes,
			count: votes.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch votes", error: err.message });
	}
};

// Get user's votes
exports.getUserVotes = async (req, res) => {
	try {
		const memberId = req.user._id;
		const { electionType } = req.query;

		const filter = { memberId };
		if (electionType) filter.electionType = electionType;

		const votes = await Vote.find(filter).populate(
			"candidateId",
			"name candidateType"
		);

		return res.json({
			message: "User votes retrieved successfully",
			votes,
			count: votes.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch user votes", error: err.message });
	}
};
