// Permission naming convention:
// category.action
// Example: users.create, users.edit, roles.delete

export const PERMISSIONS = {
  USERS: {
    CREATE: "users.create",
    VIEW: "users.view",
    EDIT: "users.edit",
    DELETE: "users.delete",
  },
  ROLES: {
    CREATE: "roles.create",
    VIEW: "roles.view",
    EDIT: "roles.edit",
    DELETE: "roles.delete",
  },
};