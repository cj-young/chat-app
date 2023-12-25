"use client";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
import { IClientServer } from "@/types/server";
import {
  IClientDm,
  IClientGroupChat,
  IProfile,
  TOnlineStatus
} from "@/types/user";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { usePusher } from "./PusherContext";

interface IAuthContext {
  profile: IProfile;
  friendRequests: IProfile[];
  fulfillFriendRequest(
    userId: string,
    method: "accept" | "decline"
  ): Promise<void>;
  friends: IProfile[];
  directMessages: IClientDm[];
  setDirectMessages: Dispatch<SetStateAction<IClientDm[]>>;
  groupChats: IClientGroupChat[];
  setGroupChats: Dispatch<SetStateAction<IClientGroupChat[]>>;
  signOut(): Promise<void>;
  servers: { uiOrder: number; server: IClientServer }[];
}

interface Props {
  children: ReactNode;
  initialProfile: IProfile;
  initialFriendRequests: IProfile[];
  initialFriends: IProfile[];
  initialDirectMessages: IClientDm[];
  initialGroupChats: IClientGroupChat[];
  initialServers: { uiOrder: number; server: IClientServer }[];
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthContextProvider({
  children,
  initialProfile,
  initialFriendRequests,
  initialFriends,
  initialDirectMessages,
  initialGroupChats,
  initialServers
}: Props) {
  const [profile, setProfile] = useState<IProfile>(initialProfile);
  const [friendRequests, setFriendRequests] = useState<IProfile[]>(
    initialFriendRequests
  );
  const [friends, setFriends] = useState<IProfile[]>(initialFriends);
  const [directMessages, setDirectMessages] = useState<IClientDm[]>(
    initialDirectMessages
  );
  const [groupChats, setGroupChats] =
    useState<IClientGroupChat[]>(initialGroupChats);
  const [servers, setServers] = useState(initialServers);
  const router = useRouter();
  const {
    joinAppChannel,
    leaveAppChannel,
    subscribeToEvent,
    unsubscribeFromEvent
  } = usePusher();

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "friendRequest",
    (request: IProfile) => {
      if (
        !friendRequests.some((prevRequest) => prevRequest.id === request.id)
      ) {
        setFriendRequests([...friendRequests, request]);
      }
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "friendAccept",
    ({ user, dmChat }: { user: IProfile; dmChat: IClientDm }) => {
      setFriends((prevFriends) =>
        prevFriends.some((prevFriend) => prevFriend.id === user.id)
          ? prevFriends
          : [...prevFriends, user]
      );
      setDirectMessages((prevDirectMessages) =>
        directMessages.some((prevDm) => prevDm.chatId === dmChat.chatId)
          ? prevDirectMessages
          : [
              ...prevDirectMessages,
              { ...dmChat, lastMessageAt: new Date(dmChat.lastMessageAt) }
            ]
      );
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "friendRemove",
    ({ userId }: { userId: string }) => {
      setFriends((prev) => prev.filter((friend) => friend.id !== userId));
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "dmCreated",
    ({ dmChat }: { dmChat: IClientDm }) => {
      setDirectMessages((prev) =>
        prev.some((prevDm) => prevDm.chatId === dmChat.chatId)
          ? prev
          : [...prev, dmChat]
      );
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "groupChatCreated",
    (groupChat: IClientGroupChat) => {
      setGroupChats((prev) => [
        ...prev,
        { ...groupChat, lastMessageAt: new Date(groupChat.lastMessageAt) }
      ]);
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "leftGroupChat",
    (chatId: string) => {
      setGroupChats((prev) =>
        prev.filter((prevGroupChat) => prevGroupChat.chatId !== chatId)
      );
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "serverAdded",
    ({ server, uiOrder }: { server: IClientServer; uiOrder: number }) => {
      setServers((prev) => [
        ...prev,
        { server, uiOrder: uiOrder ?? prev.length }
      ]);
    }
  );

  usePusherEvent(
    `private-user-${initialProfile.id}`,
    "serverRemoved",
    ({ serverId }: { serverId: string }) => {
      setServers((prev) =>
        prev.filter((prevServer) => prevServer.server.serverId !== serverId)
      );
    }
  );

  useEffect(() => {
    joinAppChannel();

    return leaveAppChannel;
  }, []);

  useEffect(() => {
    const friendStatusCallbacks = new Map<string, Function>();
    for (let friend of friends) {
      if (friendStatusCallbacks.has(friend.id)) continue;
      const onOnlineStatusChange = ({
        onlineStatus
      }: {
        onlineStatus: TOnlineStatus;
      }) => {
        setFriends((prev) =>
          prev.map((prevFriend) =>
            prevFriend.id !== friend.id
              ? prevFriend
              : { ...prevFriend, onlineStatus }
          )
        );
      };
      friendStatusCallbacks.set(friend.id, onOnlineStatusChange);
      subscribeToEvent(
        `profile-${friend.id}`,
        "onlineStatusChanged",
        onOnlineStatusChange
      );
    }

    return () => {
      for (let [friendId, callback] of friendStatusCallbacks) {
        unsubscribeFromEvent(
          `profile-${friendId}`,
          "onlineStatusChanged",
          callback
        );
      }
    };
  }, [friends]);

  useEffect(() => {
    const dmStatusCallbacks = new Map<string, Function>();
    for (let directMessage of directMessages) {
      if (dmStatusCallbacks.has(directMessage.user.id)) continue;
      const onOnlineStatusChange = ({
        onlineStatus
      }: {
        onlineStatus: TOnlineStatus;
      }) => {
        setDirectMessages((prev) =>
          prev.map((prevDirectMessage) =>
            prevDirectMessage.user.id !== directMessage.user.id
              ? prevDirectMessage
              : {
                  ...prevDirectMessage,
                  user: { ...prevDirectMessage.user, onlineStatus }
                }
          )
        );
      };
      dmStatusCallbacks.set(directMessage.user.id, onOnlineStatusChange);
      subscribeToEvent(
        `profile-${directMessage.user.id}`,
        "onlineStatusChanged",
        onOnlineStatusChange
      );
    }

    return () => {
      for (let [userId, callback] of dmStatusCallbacks) {
        unsubscribeFromEvent(
          `profile-${userId}`,
          "onlineStatusChanged",
          callback
        );
      }
    };
  }, [directMessages]);

  async function fulfillFriendRequest(
    userId: string,
    method: "accept" | "decline"
  ) {
    let targetRequest;
    setFriendRequests((prevFriendRequests) =>
      prevFriendRequests.filter((request) => {
        if (request.id === userId) {
          targetRequest = request;
          return false;
        }
        return true;
      })
    );

    try {
      const res = await apiFetch(`/friends/${method}`, "POST", {
        receiverId: userId
      });
      const data = await res.json();
    } catch (error) {
      console.error(error);
    }
  }

  async function signOut() {
    try {
      router.push("/api/auth/sign-out");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        profile,
        friendRequests,
        fulfillFriendRequest,
        friends,
        directMessages,
        setDirectMessages,
        signOut,
        groupChats,
        setGroupChats,
        servers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
