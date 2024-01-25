"use client";
import usePusherEvent from "@/hooks/usePusherEvent";
import { IClientMember, IClientServer, TRole } from "@/types/server";
import { TOnlineStatus } from "@/types/user";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { usePusher } from "./PusherContext";

interface IServerContext {
  serverInfo: IClientServer;
  role: TRole;
  members: IClientMember[];
}

const ServerContext = createContext<IServerContext>({} as IServerContext);

interface Props {
  children: ReactNode;

  initialServerInfo: IClientServer;
  initialRole: TRole;
  initialMembers: IClientMember[];
}

export default function ServerContextProvider({
  children,
  initialServerInfo,
  initialRole,
  initialMembers
}: Props) {
  const [serverInfo, setServerInfo] = useState(initialServerInfo);
  const [role, setRole] = useState(initialRole);
  const [members, setMembers] = useState(initialMembers);

  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userJoined",
    (member: IClientMember) => {
      setMembers((prev) => [...prev, member]);
    }
  );

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userLeft",
    ({ memberId }: { memberId: string }) => {
      setMembers((prev) =>
        prev.filter((prevMember) => prevMember.id !== memberId)
      );
    }
  );

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "memberRoleChanged",
    ({ memberId, newRole }: { memberId: string; newRole: TRole }) => {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    }
  );

  useEffect(() => {
    const memberCallbacks = new Map<string, Function>();
    for (let member of members) {
      if (memberCallbacks.has(member.user.id)) continue;
      const onOnlineStatusChange = ({
        onlineStatus
      }: {
        onlineStatus: TOnlineStatus;
      }) => {
        setMembers((prev) =>
          prev.map((prevMember) =>
            prevMember.user.id !== member.user.id
              ? prevMember
              : { ...member, user: { ...member.user, onlineStatus } }
          )
        );
      };

      memberCallbacks.set(member.user.id, onOnlineStatusChange);
      subscribeToEvent(
        `profile-${member.user.id}`,
        "onlineStatusChanged",
        onOnlineStatusChange
      );
    }
    return () => {
      for (let [userId, callback] of memberCallbacks) {
        unsubscribeFromEvent(
          `profile-${userId}`,
          "onlineStatusChanged",
          callback
        );
      }
    };
  }, [members]);

  return (
    <ServerContext.Provider value={{ serverInfo, role, members }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
