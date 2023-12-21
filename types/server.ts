export interface IClientServer {
  serverId: string;
  name: string;
  imageUrl: string;
}

export interface IClientChannel {
  serverId: string;
  channelId: string;
  name: string;
  type: "text";
  uiOrder: number;
}

export type TRole = "owner" | "admin" | "guest";
