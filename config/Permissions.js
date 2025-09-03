/** @format */

const Permissions = {
	// Dashboard Access
	VIEW_DASHBOARD: "view_dashboard",
	VIEW_ANALYTICS: "view_analytics",
	VIEW_REPORTS: "view_reports",

	// Election Management
	CREATE_ELECTION: "create_election",
	VIEW_ELECTIONS: "view_elections",
	EDIT_ELECTION: "edit_election",
	DELETE_ELECTION: "delete_election",
	START_ELECTION: "start_election",
	CLOSE_ELECTION: "close_election",
	VIEW_ELECTION_RESULTS: "view_election_results",

	// User Management
	VIEW_USERS: "view_users",
	CREATE_USER: "create_user",
	EDIT_USER: "edit_user",
	DELETE_USER: "delete_user",
	VERIFY_USER: "verify_user",
	VIEW_UNVERIFIED_USERS: "view_unverified_users",
	MANAGE_USER_ROLES: "manage_user_roles",

	// Committee Management
	VIEW_COMMITTEES: "view_committees",
	CREATE_COMMITTEE: "create_committee",
	EDIT_COMMITTEE: "edit_committee",
	DELETE_COMMITTEE: "delete_committee",
	MANAGE_COMMITTEE_MEMBERS: "manage_committee_members",

	// Candidate Management
	VIEW_CANDIDATES: "view_candidates",
	CREATE_CANDIDATE: "create_candidate",
	EDIT_CANDIDATE: "edit_candidate",
	DELETE_CANDIDATE: "delete_candidate",
	APPROVE_CANDIDATE: "approve_candidate",

	// Vote Management
	CAST_VOTE: "cast_vote",
	VIEW_OWN_VOTES: "view_own_votes",
	VIEW_ALL_VOTES: "view_all_votes",
	VIEW_VOTE_RESULTS: "view_vote_results",

	// System Settings
	MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
	VIEW_SYSTEM_LOGS: "view_system_logs",
	MANAGE_BACKUPS: "manage_backups",

	// Committee-Specific Permissions (for future scalability)
	VIEW_OWN_COMMITTEE: "view_own_committee",
	MANAGE_OWN_COMMITTEE_MEMBERS: "manage_own_committee_members",
	VIEW_COMMITTEE_ANALYTICS: "view_committee_analytics",
};

module.exports = Permissions;
