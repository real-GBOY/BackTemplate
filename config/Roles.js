/** @format */

const Permissions = require("./Permissions");
const Roles = [
	{
		key: "admin",
		permissions: Object.values(Permissions),
	},
	
];

module.exports = Roles;
