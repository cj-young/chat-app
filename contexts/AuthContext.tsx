"use client";
import { apiFetch } from "@/lib/api";
import { pusherClient } from "@/lib/pusher";
import { IClientDm, IProfile } from "@/types/user";
import { useRouter } from "next/navigation";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

interface IAuthContext {
  profile: IProfile | null;
  friendRequests: IProfile[];
  fulfillFriendRequest(
    userId: string,
    method: "accept" | "decline"
  ): Promise<void>;
  friends: IProfile[];
  directMessages: IClientDm[];
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

  useEffect(() => {
    console.log(`private-user-${initialProfile.id}`);
    pusherClient.subscribe(`private-user-${initialProfile.id}`);

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
      console.log({ user, dmChat });
      if (!friends.some((prevFriend) => prevFriend.id === user.id)) {
        setFriends([...friends, user]);
      }
      if (!directMessages.some((prevDm) => prevDm.chatId === dmChat.chatId)) {
        setDirectMessages((prev) => [...prev, dmChat]);
      }
    };

    pusherClient.bind("friendRequest", onFriendRequest);
    pusherClient.bind("friendAccept", onFriendAccept);

    return () => {
      pusherClient.unsubscribe(`private-user-${initialProfile.id}`);
      pusherClient.unbind("friendRequest", onFriendRequest);
      pusherClient.unbind("friendAccept", onFriendAccept);
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
      console.log(data);
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
