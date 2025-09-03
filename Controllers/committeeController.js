/** @format */

const Committee = require("../Models/Committee");
const User = require("../Models/User");

// Create committee (admin only)
exports.createCommittee = async (req, res) => {
	try {
		const { name, description, members } = req.body;
		const createdBy = req.user._id;

		if (!name || !description) {
			return res.status(400).json({
				message: "name and description are required",
			});
		}

		// Validate members if provided
		if (members && members.length > 0) {
			const validMembers = await User.find({
				_id: { $in: members },
				isVerified: true,
			});

			if (validMembers.length !== members.length) {
				return res.status(400).json({
					message: "Some members are invalid or not verified",
				});
			}

			// Check if any members already belong to other committees
			const existingMembers = await User.find({
				_id: { $in: members },
				committeeId: { $exists: true, $ne: null },
			});

			if (existingMembers.length > 0) {
				return res.status(400).json({
					message: "Some members already belong to other committees",
					existingMembers: existingMembers.map((member) => ({
						id: member._id,
						email: member.email,
					})),
				});
			}
		}

		const committee = await Committee.create({
			name,
			description,
			members: members || [],
			createdBy,
		});

		// Update users' committeeId if members were provided
		if (members && members.length > 0) {
			await User.updateMany(
				{ _id: { $in: members } },
				{ committeeId: committee._id }
			);
		}

		// Populate members for response
		await committee.populate("members", "email role isVerified");

		return res.status(201).json({
			message: "Committee created successfully",
			committee,
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({
				message: "Committee name already exists",
			});
		}
		return res
			.status(500)
			.json({ message: "Failed to create committee", error: err.message });
	}
};

// Get all committees
exports.getCommittees = async (req, res) => {
	try {
		const { isActive } = req.query;

		const filter = {};
		if (isActive !== undefined) {
			filter.isActive = isActive === "true";
		}

		const committees = await Committee.find(filter)
			.populate("members", "email role isVerified")
			.populate("createdBy", "email")
			.sort({ createdAt: -1 });

		return res.json({
			message: "Committees retrieved successfully",
			committees,
			count: committees.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch committees", error: err.message });
	}
};

// Get committee by ID
exports.getCommitteeById = async (req, res) => {
	try {
		const { id } = req.params;

		const committee = await Committee.findById(id)
			.populate("members", "email role isVerified")
			.populate("createdBy", "email");

		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		return res.json({
			message: "Committee retrieved successfully",
			committee,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch committee", error: err.message });
	}
};

// Update committee (admin only)
exports.updateCommittee = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, isActive } = req.body;

		const committee = await Committee.findById(id);

		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		const update = {};
		if (name !== undefined) update.name = name;
		if (description !== undefined) update.description = description;
		if (isActive !== undefined) update.isActive = isActive;

		const updatedCommittee = await Committee.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		})
			.populate("members", "email role isVerified")
			.populate("createdBy", "email");

		return res.json({
			message: "Committee updated successfully",
			committee: updatedCommittee,
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({
				message: "Committee name already exists",
			});
		}
		return res
			.status(500)
			.json({ message: "Failed to update committee", error: err.message });
	}
};

// Delete committee (admin only)
exports.deleteCommittee = async (req, res) => {
	try {
		const { id } = req.params;

		const committee = await Committee.findById(id);

		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		// Check if committee has active elections
		const Election = require("../Models/Election");
		const activeElections = await Election.find({
			committeeId: id,
			status: { $in: ["draft", "active"] },
		});

		if (activeElections.length > 0) {
			return res.status(400).json({
				message: "Cannot delete committee with active or draft elections",
				activeElections: activeElections.map((election) => ({
					id: election._id,
					title: election.title,
					status: election.status,
				})),
			});
		}

		// Remove committeeId from all users in this committee
		await User.updateMany({ committeeId: id }, { $unset: { committeeId: 1 } });

		// Delete the committee
		await Committee.findByIdAndDelete(id);

		return res.json({
			message: "Committee deleted successfully",
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to delete committee", error: err.message });
	}
};

// Add member to committee (admin only)
exports.addMember = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({
				message: "userId is required",
			});
		}

		const committee = await Committee.findById(id);
		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		if (!committee.isActive) {
			return res.status(400).json({
				message: "Cannot add members to inactive committee",
			});
		}

		// Check if user exists and is verified
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!user.isVerified) {
			return res.status(400).json({
				message: "Only verified users can be added to committees",
			});
		}

		// Check if user already belongs to another committee
		if (user.committeeId && user.committeeId.toString() !== id) {
			return res.status(400).json({
				message: "User already belongs to another committee",
			});
		}

		// Check if user is already a member
		if (committee.isMember(userId)) {
			return res.status(409).json({
				message: "User is already a member of this committee",
			});
		}

		// Add member to committee
		await committee.addMember(userId);

		// Update user's committeeId
		await User.findByIdAndUpdate(userId, { committeeId: id });

		// Populate and return updated committee
		await committee.populate("members", "email role isVerified");

		return res.json({
			message: "Member added to committee successfully",
			committee,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to add member", error: err.message });
	}
};

// Remove member from committee (admin only)
exports.removeMember = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({
				message: "userId is required",
			});
		}

		const committee = await Committee.findById(id);
		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		// Check if user is a member
		if (!committee.isMember(userId)) {
			return res.status(404).json({
				message: "User is not a member of this committee",
			});
		}

		// Check if user is a candidate in any active elections
		const Candidate = require("../Models/Candidate");
		const activeCandidates = await Candidate.find({
			userId,
			committeeId: id,
			status: "active",
		}).populate("electionId", "status title");

		const activeElections = activeCandidates.filter(
			(candidate) => candidate.electionId.status === "active"
		);

		if (activeElections.length > 0) {
			return res.status(400).json({
				message:
					"Cannot remove member who is an active candidate in ongoing elections",
				activeElections: activeElections.map((candidate) => ({
					electionId: candidate.electionId._id,
					electionTitle: candidate.electionId.title,
					candidateName: candidate.name,
				})),
			});
		}

		// Remove member from committee
		await committee.removeMember(userId);

		// Update user's committeeId
		await User.findByIdAndUpdate(userId, { $unset: { committeeId: 1 } });

		// Populate and return updated committee
		await committee.populate("members", "email role isVerified");

		return res.json({
			message: "Member removed from committee successfully",
			committee,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to remove member", error: err.message });
	}
};

// Get committee members
exports.getCommitteeMembers = async (req, res) => {
	try {
		const { id } = req.params;

		const committee = await Committee.findById(id).populate(
			"members",
			"email role isVerified createdAt"
		);

		if (!committee) {
			return res.status(404).json({ message: "Committee not found" });
		}

		return res.json({
			message: "Committee members retrieved successfully",
			members: committee.members,
			count: committee.members.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({
				message: "Failed to fetch committee members",
				error: err.message,
			});
	}
};

// Get committees for a user
exports.getUserCommittees = async (req, res) => {
	try {
		const userId = req.user._id;

		const committees = await Committee.find({
			members: userId,
			isActive: true,
		})
			.populate("members", "email role")
			.populate("createdBy", "email");

		return res.json({
			message: "User committees retrieved successfully",
			committees,
			count: committees.length,
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Failed to fetch user committees", error: err.message });
	}
};
