/**
 * Access Policies Configuration
 * Defines role-based access control using $or pipelines for different resources
 *
 * @format
 */

const accessPolicies = {
	// Team access policies
	teams: {
		// President can see all teams
		President: () => ({}),

		// Head can see teams they created or are part of
		Head: (user) => ({
			$or: [{ createdBy: user._id }, { _id: user.team }],
		}),

		// ViceHead can see teams they created or are part of
		ViceHead: (user) => ({
			$or: [{ createdBy: user._id }, { _id: user.team }],
		}),

		// Member can only see their own team
		Member: (user) => ({
			_id: user.team,
		}),

		// HrMember can only see their own team
		HrMember: (user) => ({
			_id: user.team,
		}),
	},

	// User access policies removed; user visibility is enforced via permission + utils/userFilters

	// Feedback access policies removed; feedback visibility is enforced via permissions + utils/feedbackFilters

	// Attendance access policies
	attendance: {
		// President can see all attendance
		President: () => ({}),

		// Head can see attendance in their team
		Head: (user) => ({
			teamId: user.team,
		}),

		// ViceHead can see attendance in their team
		ViceHead: (user) => ({
			teamId: user.team,
		}),

		// Member can only see their own attendance
		Member: (user) => ({
			userId: user._id,
		}),

		// HrMember can see attendance in their team
		HrMember: (user) => ({
			teamId: user.team,
		}),
	},
};

/**
 * Get access filter for a specific resource and user
 * @param {string} resource - The resource type (tasks, events, teams, users, feedbacks, attendance)
 * @param {Object} user - The user object with role and team information
 * @returns {Object} MongoDB filter object
 */
const getAccessFilter = (resource, user) => {
	// If no user, return empty filter (no access)
	if (!user) {
		return { _id: null }; // This will return no results
	}

	// Get user's role name - handle both populated role object and role key
	let roleName;
	if (user.role && typeof user.role === "object" && user.role.key) {
		roleName = user.role.key;
	} else if (typeof user.role === "string") {
		roleName = user.role;
	} else {
		console.warn("No valid role found for user:", user);
		return { _id: null };
	}

	// If no role, return empty filter
	if (!roleName) {
		return { _id: null };
	}

	// Get the policy for this resource and role
	const resourcePolicies = accessPolicies[resource];
	if (!resourcePolicies) {
		console.warn(`No access policies defined for resource: ${resource}`);
		return { _id: null };
	}

	const rolePolicy = resourcePolicies[roleName];
	if (!rolePolicy) {
		console.warn(
			`No access policy defined for role: ${roleName} on resource: ${resource}`
		);
		return { _id: null };
	}

	// Return the filter for this user and role
	return rolePolicy(user);
};

/**
 * Apply access filter to a query
 * @param {Object} Model - Mongoose model
 * @param {string} resource - Resource type
 * @param {Object} user - User object
 * @param {Object} additionalFilter - Additional filter to apply
 * @returns {Promise<Array>} Filtered results
 */
const getFilteredData = async (
	Model,
	resource,
	user,
	additionalFilter = {}
) => {
	const accessFilter = getAccessFilter(resource, user);
	const combinedFilter = { ...accessFilter, ...additionalFilter };

	return await Model.find(combinedFilter);
};

/**
 * Apply access filter to an aggregation pipeline
 * @param {Object} Model - Mongoose model
 * @param {string} resource - Resource type
 * @param {Object} user - User object
 * @param {Array} pipeline - Additional aggregation stages
 * @returns {Promise<Array>} Filtered results
 */
const getFilteredAggregation = async (Model, resource, user, pipeline = []) => {
	const accessFilter = getAccessFilter(resource, user);

	const fullPipeline = [{ $match: accessFilter }, ...pipeline];

	return await Model.aggregate(fullPipeline);
};

module.exports = {
	accessPolicies,
	getAccessFilter,
	getFilteredData,
	getFilteredAggregation,
};
