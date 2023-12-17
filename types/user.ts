export interface IProfile {
  email: string;
  username: string;
  displayName: string;
  imageUrl: string;
  id: string;
  onlineStatus: TOnlineStatus;
}

export type TOnlineStatus = "online" | "offline" | "idle" | "doNotDisturb";

export interface IClientDm {
  user: IProfile;
  unreadMessages: number;
  chatId: string;
  lastMessageAt: Date;
}

export interface IClientMessage {
  content: string;
  sender: IProfile;
  chatId: string;
  timestamp: Date;
  id: string;
}

export interface ITempMessage {
  content: string;
  sender: IProfile;
  timestamp: Date;
  id: string;
}
