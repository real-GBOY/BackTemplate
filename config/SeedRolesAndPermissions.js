const dbconnect = require('../config/dbconfig');
const Role = require('../Models/Role');
const Permission = require('../Models/Permission');
const Roles = require('../config/Roles');
const Permissions = require('../config/Permissions');
const dotenv = require('dotenv');
dotenv.config();
 
const seedRolesAndPermissions = async () => {
  try {
    dbconnect();

    // 1. Seed all permissions
    const permissionKeys = Object.values(Permissions);
    const permissionDocs = await Promise.all(
      permissionKeys.map(async (key) => {
        return await Permission.findOneAndUpdate(
          { key },
          { key },
          { upsert: true, new: true }
        );
      })
    );

    console.log('✅ Permissions seeded.');

    // 2. Seed roles with related permissions
    const rolePromises = Roles.map(async (role) => {
      const matchedPermissions = permissionDocs.filter((perm) =>
        role.permissions.includes(perm.key)
      );

      return await Role.findOneAndUpdate(
        { key: role.key },
        { key: role.key, permissions: matchedPermissions.map(p => p._id) },
        { upsert: true, new: true }
      );
    });

    const roles = await Promise.all(rolePromises);
    console.log('✅ Roles seeded:', roles.map(r => r.key));
  } catch (err) {
    console.error('❌ Error seeding roles and permissions:', err);
  }
};

seedRolesAndPermissions();
