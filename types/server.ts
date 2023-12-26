import { IProfile } from "./user";

export interface IClientServer {
  serverId: string;
  name: string;
  imageUrl: string;
}

export interface IClientChannel {
  serverId: string;
  channelId: string;
  name: string;
  type: TChannelType;
  uiOrder: number;
}

export type TRole = "owner" | "admin" | "guest";

export interface IClientMember {
  id: string;
  role: TRole;
  user: IProfile;
}

export type TChannelType = "text" | "voice";
