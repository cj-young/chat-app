import { IServer } from "@/models/server/Server";
import { IClientServer } from "@/types/server";

export function sterilizeClientServer(
  server: Pick<IServer, "id" | "name" | "imageUrl">
): IClientServer {
  return {
    serverId: server.id,
    name: server.name,
    imageUrl: server.imageUrl
  };
}
