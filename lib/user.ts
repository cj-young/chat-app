import { TOnlineStatus } from "@/types/user";

const formattedOnlineStatuses = new Map<TOnlineStatus, string>([
  ["online", "Online"],
  ["offline", "Offline"],
  ["idle", "Idle"],
  ["doNotDisturb", "Do Not Disturb"]
]);

export function formatOnlineStatus(status: TOnlineStatus) {
  return formattedOnlineStatuses.get(status);
}
