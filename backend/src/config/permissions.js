// src/config/permissions.js
export const ROLE_PERMISSIONS = {
  admin: ["*"],

  support: [
    "users:read",
    "tickets:read",
    "chatbot:read",
    "chatbot:manage",
    "logs:read",
    "logs:export",
  ],

  catalog: [
    "products:read",
    "products:write",
    "reports:export",
    "dashboard:read",
  ],

  finance: [
    "tickets:read",
    "reports:export",
    "dashboard:read",
  ],

  user: [],
  premium: [],
};

export function roleHasPermission(role, perm) {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(perm);
}



