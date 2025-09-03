/** @format */

const dbconnect = require("../config/dbconfig");
const Role = require("../Models/Role");
const Permission = require("../Models/Permission");
const Roles = require("../config/Roles");
const Permissions = require("../config/Permissions");
const dotenv = require("dotenv");
dotenv.config();

const seedRolesAndPermissions = async () => {
	try {
		dbconnect();

		// 1. Seed all permissions with proper data
		const permissionEntries = Object.entries(Permissions);
		const permissionDocs = await Promise.all(
			permissionEntries.map(async ([permissionKey, key]) => {
				// Create permission data based on key
				const permissionData = createPermissionData(permissionKey, key);

				return await Permission.findOneAndUpdate({ key }, permissionData, {
					upsert: true,
					new: true,
				});
			})
		);

		console.log("✅ Permissions seeded:", permissionDocs.length);

		// 2. Seed roles with related permissions
		const rolePromises = Roles.map(async (role) => {
			const matchedPermissions = permissionDocs.filter((perm) =>
				role.permissions.includes(perm.key)
			);

			return await Role.findOneAndUpdate(
				{ key: role.key },
				{
					key: role.key,
					name: role.name,
					description: role.description,
					permissions: matchedPermissions.map((p) => p._id),
				},
				{ upsert: true, new: true }
			);
		});

		const roles = await Promise.all(rolePromises);
		console.log(
			"✅ Roles seeded:",
			roles.map((r) => r.key)
		);
	} catch (err) {
		console.error("❌ Error seeding roles and permissions:", err);
	}
};

// Helper function to create permission data
const createPermissionData = (permissionKey, key) => {
	const permissionMap = {
		// Dashboard Access
		VIEW_DASHBOARD: {
			name: "View Dashboard",
			description: "Access to main dashboard",
			category: "dashboard_access",
		},
		VIEW_ANALYTICS: {
			name: "View Analytics",
			description: "Access to analytics and reports",
			category: "dashboard_access",
		},
		VIEW_REPORTS: {
			name: "View Reports",
			description: "Access to system reports",
			category: "dashboard_access",
		},

		// Election Management
		CREATE_ELECTION: {
			name: "Create Election",
			description: "Create new elections",
			category: "election_management",
		},
		VIEW_ELECTIONS: {
			name: "View Elections",
			description: "View all elections",
			category: "election_management",
		},
		EDIT_ELECTION: {
			name: "Edit Election",
			description: "Edit election details",
			category: "election_management",
		},
		DELETE_ELECTION: {
			name: "Delete Election",
			description: "Delete elections",
			category: "election_management",
		},
		START_ELECTION: {
			name: "Start Election",
			description: "Start elections",
			category: "election_management",
		},
		CLOSE_ELECTION: {
			name: "Close Election",
			description: "Close elections",
			category: "election_management",
		},
		VIEW_ELECTION_RESULTS: {
			name: "View Election Results",
			description: "View election results",
			category: "election_management",
		},

		// User Management
		VIEW_USERS: {
			name: "View Users",
			description: "View all users",
			category: "user_management",
		},
		CREATE_USER: {
			name: "Create User",
			description: "Create new users",
			category: "user_management",
		},
		EDIT_USER: {
			name: "Edit User",
			description: "Edit user details",
			category: "user_management",
		},
		DELETE_USER: {
			name: "Delete User",
			description: "Delete users",
			category: "user_management",
		},
		VERIFY_USER: {
			name: "Verify User",
			description: "Verify user accounts",
			category: "user_management",
		},
		VIEW_UNVERIFIED_USERS: {
			name: "View Unverified Users",
			description: "View unverified users",
			category: "user_management",
		},
		MANAGE_USER_ROLES: {
			name: "Manage User Roles",
			description: "Assign and modify user roles",
			category: "user_management",
		},

		// Committee Management
		VIEW_COMMITTEES: {
			name: "View Committees",
			description: "View all committees",
			category: "committee_management",
		},
		CREATE_COMMITTEE: {
			name: "Create Committee",
			description: "Create new committees",
			category: "committee_management",
		},
		EDIT_COMMITTEE: {
			name: "Edit Committee",
			description: "Edit committee details",
			category: "committee_management",
		},
		DELETE_COMMITTEE: {
			name: "Delete Committee",
			description: "Delete committees",
			category: "committee_management",
		},
		MANAGE_COMMITTEE_MEMBERS: {
			name: "Manage Committee Members",
			description: "Add/remove committee members",
			category: "committee_management",
		},

		// Candidate Management
		VIEW_CANDIDATES: {
			name: "View Candidates",
			description: "View all candidates",
			category: "candidate_management",
		},
		CREATE_CANDIDATE: {
			name: "Create Candidate",
			description: "Register as candidate",
			category: "candidate_management",
		},
		EDIT_CANDIDATE: {
			name: "Edit Candidate",
			description: "Edit candidate details",
			category: "candidate_management",
		},
		DELETE_CANDIDATE: {
			name: "Delete Candidate",
			description: "Delete candidates",
			category: "candidate_management",
		},
		APPROVE_CANDIDATE: {
			name: "Approve Candidate",
			description: "Approve candidate registrations",
			category: "candidate_management",
		},

		// Vote Management
		CAST_VOTE: {
			name: "Cast Vote",
			description: "Cast votes in elections",
			category: "vote_management",
		},
		VIEW_OWN_VOTES: {
			name: "View Own Votes",
			description: "View personal voting history",
			category: "vote_management",
		},
		VIEW_ALL_VOTES: {
			name: "View All Votes",
			description: "View all votes (admin)",
			category: "vote_management",
		},
		VIEW_VOTE_RESULTS: {
			name: "View Vote Results",
			description: "View election results",
			category: "vote_management",
		},

		// System Settings
		MANAGE_SYSTEM_SETTINGS: {
			name: "Manage System Settings",
			description: "Modify system settings",
			category: "system_settings",
		},
		VIEW_SYSTEM_LOGS: {
			name: "View System Logs",
			description: "Access system logs",
			category: "system_settings",
		},
		MANAGE_BACKUPS: {
			name: "Manage Backups",
			description: "Create and restore backups",
			category: "system_settings",
		},

		// Committee-Specific Permissions
		VIEW_OWN_COMMITTEE: {
			name: "View Own Committee",
			description: "View own committee details and members",
			category: "committee_specific",
		},
		MANAGE_OWN_COMMITTEE_MEMBERS: {
			name: "Manage Own Committee Members",
			description: "Add/remove members from own committee",
			category: "committee_specific",
		},
		VIEW_COMMITTEE_ANALYTICS: {
			name: "View Committee Analytics",
			description: "View analytics for own committee",
			category: "committee_specific",
		},
	};

	const permissionInfo = permissionMap[permissionKey] || {
		name: permissionKey
			.replace(/_/g, " ")
			.toLowerCase()
			.replace(/\b\w/g, (l) => l.toUpperCase()),
		description: `Permission for ${permissionKey
			.toLowerCase()
			.replace(/_/g, " ")}`,
		category: "general",
	};

	return {
		key,
		name: permissionInfo.name,
		description: permissionInfo.description,
		category: permissionInfo.category,
	};
};

seedRolesAndPermissions();
