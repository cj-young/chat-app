"use client";
import { apiFetch } from "@/lib/api";
import { IClientDm, IProfile } from "@/types/user";
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
  profile: IProfile | null;
  friendRequests: IProfile[];
  fulfillFriendRequest(
    userId: string,
    method: "accept" | "decline"
  ): Promise<void>;
  friends: IProfile[];
  directMessages: IClientDm[];
  setDirectMessages: Dispatch<SetStateAction<IClientDm[]>>;
  signOut(): Promise<void>;
}

interface Props {
  children: ReactNode;
  initialProfile: IProfile;
  initialFriendRequests: IProfile[];
  initialFriends: IProfile[];
  initialDirectMessages: IClientDm[];
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthContextProvider({
  children,
  initialProfile,
  initialFriendRequests,
  initialFriends,
  initialDirectMessages
}: Props) {
  const [profile, setProfile] = useState<IProfile>(initialProfile);
  const [friendRequests, setFriendRequests] = useState<IProfile[]>(
    initialFriendRequests
  );
  const [friends, setFriends] = useState<IProfile[]>(initialFriends);
  const [directMessages, setDirectMessages] = useState<IClientDm[]>(
    initialDirectMessages
  );
  const router = useRouter();
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  useEffect(() => {
    const onFriendRequest = (request: IProfile) => {
      if (
        !friendRequests.some((prevRequest) => prevRequest.id === request.id)
      ) {
        setFriendRequests([...friendRequests, request]);
      }
    };

    const onFriendAccept = ({
      user,
      dmChat
    }: {
      user: IProfile;
      dmChat: IClientDm;
    }) => {
      setFriends((prevFriends) =>
        prevFriends.some((prevFriend) => prevFriend.id === user.id)
          ? prevFriends
          : [...prevFriends, user]
      );
      setDirectMessages((prevDirectMessages) =>
        directMessages.some((prevDm) => prevDm.chatId === dmChat.chatId)
          ? prevDirectMessages
          : [...prevDirectMessages, dmChat]
      );
    };

    const onFriendRemove = ({ userId }: { userId: string }) => {
      setFriends((prev) => prev.filter((friend) => friend.id !== userId));
    };

    const onDmCreated = ({ dmChat }: { dmChat: IClientDm }) => {
      setDirectMessages((prev) =>
        prev.some((prevDm) => prevDm.chatId === dmChat.chatId)
          ? prev
          : [...prev, dmChat]
      );
    };

    subscribeToEvent(
      `private-user-${initialProfile.id}`,
      "friendRequest",
      onFriendRequest
    );
    subscribeToEvent(
      `private-user-${initialProfile.id}`,
      "friendAccept",
      onFriendAccept
    );
    subscribeToEvent(
      `private-user-${initialProfile.id}`,
      "friendRemove",
      onFriendRemove
    );
    subscribeToEvent(
      `private-user-${initialProfile.id}`,
      "friendRemove",
      onDmCreated
    );

    return () => {
      unsubscribeFromEvent(
        `private-user-${initialProfile.id}`,
        "friendRequest",
        onFriendRequest
      );
      unsubscribeFromEvent(
        `private-user-${initialProfile.id}`,
        "friendAccept",
        onFriendAccept
      );
      unsubscribeFromEvent(
        `private-user-${initialProfile.id}`,
        "friendRemove",
        onFriendRemove
      );
      unsubscribeFromEvent(
        `private-user-${initialProfile.id}`,
        "friendRemove",
        onDmCreated
      );
    };
  }, []);

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
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
