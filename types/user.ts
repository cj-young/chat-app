export interface IProfile {
  email: string;
  username: string;
  displayName: string;
  imageUrl: string;
  id: string;
  onlineStatus: TOnlineStatus;
}

export type TOnlineStatus = "online" | "offline" | "idle" | "doNotDisturb";
