import { TRole } from "@/types/server";

export const formattedServerRoles = new Map<TRole, string>([
  ["owner", "Owner"],
  ["admin", "Admin"],
  ["guest", "Guest"]
]);

export const serverRolePriorities = new Map<TRole, number>([
  ["owner", 0],
  ["admin", 1],
  ["guest", 2]
]);
