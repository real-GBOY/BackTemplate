/** @format */

const Election = require("../Models/Election");

// Create election (admin only)
exports.createElection = async (req, res) => {
	try {
		const {
			electionType,
			title,
			description,
			startDate,
			endDate,
			committeeId,
		} = req.body;
		const createdBy = req.user._id;

		if (!electionType || !title || !startDate || !endDate) {
			return res.status(400).json({
				message: "electionType, title, startDate, and endDate are required",
			});
		}

		// Validate election type
		if (!["board", "president"].includes(electionType)) {
			return res.status(400).json({
				message: "electionType must be 'board' or 'president'",
			});
		}

		// For board elections, committeeId is required
		if (electionType === "board" && !committeeId) {
			return res.status(400).json({
				message: "committeeId is required for board elections",
			});
		}

		// For president elections, committeeId should not be provided
		if (electionType === "president" && committeeId) {
			return res.status(400).json({
				message: "committeeId is not allowed for president elections",
			});
		}

		// Validate committee exists and is active (for board elections)
		if (electionType === "board") {
			const Committee = require("../Models/Committee");
			const committee = await Committee.findById(committeeId);
			if (!committee || !committee.isActive) {
				return res.status(400).json({
					message: "Committee not found or inactive",
				});
			}
		}

		// Validate dates
		const start = new Date(startDate);
		const end = new Date(endDate);
		const now = new Date();

		if (end <= start) {
			return res.status(400).json({
				message: "End date must be after start date",
			});
		}

		// Check for overlapping elections of the same type and committee
		const overlapFilter = {
			electionType,
			status: { $in: ["draft", "active"] },
			$or: [
				{
					// New election starts during existing election
					startDate: { $lte: end },
					endDate: { $gte: start },
				},
				{
					// New election completely contains existing election
					startDate: { $gte: start },
					endDate: { $lte: end },
				},
				{
					// New election is completely within existing election
					startDate: { $lte: start },
					endDate: { $gte: end },
				},
			],
		};

		// For board elections, also check committee overlap
		if (electionType === "board") {
			overlapFilter.committeeId = committeeId;
		}

		const overlappingElection = await Election.findOne(overlapFilter);

		if (overlappingElection) {
			return res.status(409).json({
				message:
					"An election of this type already exists during the specified period",
				conflictingElection: {
					id: overlappingElection._id,
					title: overlappingElection.title,
					startDate: overlappingElection.startDate,
					endDate: overlappingElection.endDate,
					status: overlappingElection.status,
					committeeId: overlappingElection.committeeId,
				},
			});
		}

		const election = await Election.create({
			electionType,
			title,
			description,
			startDate: start,
			endDate: end,
			createdBy,
			committeeId: electionType === "board" ? committeeId : undefined,
			status: start > now ? "draft" : "active",
		});

		// Populate committee for response
		if (electionType === "board") {
			await election.populate("committeeId", "name description");
		}

		return res.status(201).json({
			message: "Election created successfully",
			election,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to create election", error: err.message });
	}
};

// Get all elections
exports.getElections = async (req, res) => {
	try {
		const { status, electionType } = req.query;

		const filter = {};
		if (status) filter.status = status;
		if (electionType) filter.electionType = electionType;

		const elections = await Election.find(filter)
			.populate("createdBy", "email")
			.sort({ createdAt: -1 });

		return res.json({
			message: "Elections retrieved successfully",
			elections,
			count: elections.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch elections", error: err.message });
	}
};

// Get election by ID
exports.getElectionById = async (req, res) => {
	try {
		const { id } = req.params;

		const election = await Election.findById(id).populate("createdBy", "email");

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		return res.json({
			message: "Election retrieved successfully",
			election,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch election", error: err.message });
	}
};

// Update election (admin only)
exports.updateElection = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, startDate, endDate, status } = req.body;

		const election = await Election.findById(id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		// Prevent updating closed elections
		if (election.status === "closed") {
			return res.status(400).json({
				message: "Cannot update closed elections",
			});
		}

		const update = {};
		if (title !== undefined) update.title = title;
		if (description !== undefined) update.description = description;
		if (startDate !== undefined) update.startDate = new Date(startDate);
		if (endDate !== undefined) update.endDate = new Date(endDate);
		if (status !== undefined) {
			// Validate status transition
			if (election.status === "draft" && status === "closed") {
				return res.status(400).json({
					message: "Cannot close a draft election",
				});
			}
			update.status = status;
		}

		// Validate dates if provided
		if (
			update.startDate &&
			update.endDate &&
			update.endDate <= update.startDate
		) {
			return res.status(400).json({
				message: "End date must be after start date",
			});
		}

		const updatedElection = await Election.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		}).populate("createdBy", "email");

		return res.json({
			message: "Election updated successfully",
			election: updatedElection,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to update election", error: err.message });
	}
};

// Delete election (admin only)
exports.deleteElection = async (req, res) => {
	try {
		const { id } = req.params;

		const election = await Election.findById(id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		// Prevent deleting active elections
		if (election.status === "active") {
			return res.status(400).json({
				message: "Cannot delete active elections",
			});
		}

		await Election.findByIdAndDelete(id);

		return res.json({
			message: "Election deleted successfully",
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to delete election", error: err.message });
	}
};

// Start election (admin only)
exports.startElection = async (req, res) => {
	try {
		const { id } = req.params;

		const election = await Election.findById(id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "draft") {
			return res.status(400).json({
				message: "Only draft elections can be started",
			});
		}

		const now = new Date();
		if (election.startDate > now) {
			return res.status(400).json({
				message: "Cannot start election before its scheduled start date",
			});
		}

		const updatedElection = await Election.findByIdAndUpdate(
			id,
			{ status: "active" },
			{ new: true }
		).populate("createdBy", "email");

		return res.json({
			message: "Election started successfully",
			election: updatedElection,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to start election", error: err.message });
	}
};

// Close election (admin only)
exports.closeElection = async (req, res) => {
	try {
		const { id } = req.params;

		const election = await Election.findById(id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "active") {
			return res.status(400).json({
				message: "Only active elections can be closed",
			});
		}

		const updatedElection = await Election.findByIdAndUpdate(
			id,
			{ status: "closed" },
			{ new: true }
		).populate("createdBy", "email");

		return res.json({
			message: "Election closed successfully",
			election: updatedElection,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to close election", error: err.message });
	}
};

// Get active elections
exports.getActiveElections = async (req, res) => {
	try {
		const now = new Date();

		const activeElections = await Election.find({
			status: "active",
			startDate: { $lte: now },
			endDate: { $gte: now },
		}).populate("createdBy", "email");

		return res.json({
			message: "Active elections retrieved successfully",
			elections: activeElections,
			count: activeElections.length,
		});
	} catch (err) {
		return res.status(500).json({
			message: "Failed to fetch active elections",
			error: err.message,
		});
	}
};
