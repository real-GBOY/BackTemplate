/** @format */

const Permissions = require("./Permissions");

const Roles = [
	{
		key: "admin",
		name: "Administrator",
		description: "Full system access with all permissions",
		permissions: Object.values(Permissions),
	},
	{
		key: "election_manager",
		name: "Election Manager",
		description: "Can manage elections and view results",
		permissions: [
			Permissions.VIEW_DASHBOARD,
			Permissions.VIEW_ANALYTICS,
			Permissions.VIEW_REPORTS,
			Permissions.CREATE_ELECTION,
			Permissions.VIEW_ELECTIONS,
			Permissions.EDIT_ELECTION,
			Permissions.DELETE_ELECTION,
			Permissions.START_ELECTION,
			Permissions.CLOSE_ELECTION,
			Permissions.VIEW_ELECTION_RESULTS,
			Permissions.VIEW_CANDIDATES,
			Permissions.APPROVE_CANDIDATE,
			Permissions.VIEW_ALL_VOTES,
			Permissions.VIEW_VOTE_RESULTS,
		],
	},
	{
		key: "committee_head",
		name: "Committee Head",
		description: "Can manage committee members and view committee data",
		permissions: [
			Permissions.VIEW_DASHBOARD,
			Permissions.VIEW_COMMITTEES,
			Permissions.EDIT_COMMITTEE,
			Permissions.MANAGE_COMMITTEE_MEMBERS,
			Permissions.VIEW_CANDIDATES,
			Permissions.CREATE_CANDIDATE,
			Permissions.VIEW_ELECTIONS,
			Permissions.VIEW_ELECTION_RESULTS,
			Permissions.VIEW_VOTE_RESULTS,
			Permissions.VIEW_OWN_COMMITTEE,
			Permissions.MANAGE_OWN_COMMITTEE_MEMBERS,
			Permissions.VIEW_COMMITTEE_ANALYTICS,
		],
	},
	{
		key: "member",
		name: "Member",
		description: "Basic member with voting rights",
		permissions: [
			Permissions.VIEW_DASHBOARD,
			Permissions.VIEW_ELECTIONS,
			Permissions.VIEW_ELECTION_RESULTS,
			Permissions.CAST_VOTE,
			Permissions.VIEW_OWN_VOTES,
			Permissions.VIEW_CANDIDATES,
		],
	},
	{
		key: "board_candidate",
		name: "Board Candidate",
		description: "Member running for board position",
		permissions: [
			Permissions.VIEW_DASHBOARD,
			Permissions.VIEW_ELECTIONS,
			Permissions.VIEW_ELECTION_RESULTS,
			Permissions.CAST_VOTE,
			Permissions.VIEW_OWN_VOTES,
			Permissions.VIEW_CANDIDATES,
		],
	},
	{
		key: "president_candidate",
		name: "President Candidate",
		description: "Member running for president position",
		permissions: [
			Permissions.VIEW_DASHBOARD,
			Permissions.VIEW_ELECTIONS,
			Permissions.VIEW_ELECTION_RESULTS,
			Permissions.CAST_VOTE,
			Permissions.VIEW_OWN_VOTES,
			Permissions.VIEW_CANDIDATES,
		],
	},
];

module.exports = Roles;
