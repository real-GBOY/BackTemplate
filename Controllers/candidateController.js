/** @format */

const Candidate = require("../Models/Candidate");

// Create candidate
exports.createCandidate = async (req, res) => {
	try {
		const { userId, electionId, candidateType, name, status, committeeId } =
			req.body;

		if (!userId || !electionId || !candidateType || !name) {
			return res
				.status(400)
				.json({
					message: "userId, electionId, candidateType and name are required",
				});
		}

		// For board candidates, committeeId is required
		if (candidateType === "board" && !committeeId) {
			return res.status(400).json({
				message: "committeeId is required for board candidates",
			});
		}

		// For president candidates, committeeId should not be provided
		if (candidateType === "president" && committeeId) {
			return res.status(400).json({
				message: "committeeId is not allowed for president candidates",
			});
		}

		const candidate = await Candidate.create({
			userId,
			electionId,
			candidateType,
			name,
			status,
			committeeId: candidateType === "board" ? committeeId : undefined,
		});

		// Populate related data for response
		await candidate.populate([
			{ path: "userId", select: "email role" },
			{ path: "electionId", select: "title electionType status" },
			{ path: "committeeId", select: "name description" },
		]);

		return res.status(201).json({
			message: "Candidate created successfully",
			candidate,
		});
	} catch (err) {
		if (err && err.code === 11000) {
			return res
				.status(409)
				.json({ message: "candidate already exists for this user/election" });
		}
		return res
			.status(500)
			.json({ message: "failed to create candidate", error: err.message });
	}
};

// List candidates
exports.getCandidates = async (_req, res) => {
	try {
		const candidates = await Candidate.find();
		return res.json(candidates);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to fetch candidates", error: err.message });
	}
};

// Get by id
exports.getCandidateById = async (req, res) => {
	try {
		const { id } = req.params;
		const candidate = await Candidate.findById(id);
		if (!candidate) return res.status(404).json({ message: "not found" });
		return res.json(candidate);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to fetch candidate", error: err.message });
	}
};

// Update
exports.updateCandidate = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId, candidateType, name, status } = req.body;
		const update = {};
		if (userId !== undefined) update.userId = userId;
		if (candidateType !== undefined) update.candidateType = candidateType;
		if (name !== undefined) update.name = name;
		if (status !== undefined) update.status = status;
		const candidate = await Candidate.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		});
		if (!candidate) return res.status(404).json({ message: "not found" });
		return res.json(candidate);
	} catch (err) {
		if (err && err.code === 11000) {
			return res
				.status(409)
				.json({ message: "candidate already exists for this user/type" });
		}
		return res
			.status(500)
			.json({ message: "failed to update candidate", error: err.message });
	}
};

// Delete
exports.deleteCandidate = async (req, res) => {
	try {
		const { id } = req.params;
		const candidate = await Candidate.findByIdAndDelete(id);
		if (!candidate) return res.status(404).json({ message: "not found" });
		return res.json({ message: "candidate deleted" });
	} catch (err) {
		return res
			.status(500)
			.json({ message: "failed to delete candidate", error: err.message });
	}
};
