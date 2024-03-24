import AuthContextProvider from "@/contexts/AuthContext";
import VoiceCallContextProvider from "@/contexts/VoiceChatContext";
import { getSessionUser, getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientDm } from "@/lib/directMessages";
import { sterilizeClientGroupChat } from "@/lib/groupChat";
import { sterilizeClientServer } from "@/lib/server";
import { IProfile } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import MainNavbar from "./components/MainNavbar";
import ModalDisplay from "./components/ModalDisplay";
import PopupMenuDisplay from "./components/PopupMenuDisplay";
import styles from "./layout.module.scss";

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const sessionId = cookies().get("session")?.value;

  if (!sessionId || sessionId[0] !== "1") {
    redirect("/login");
  }
  await dbConnect();

  console.log("sessionId", sessionId);
  const user = await getSessionUser(sessionId.slice(1));
  console.log("user", user);

  if (!user) {
    redirect("/login");
  }

  const profile: IProfile = {
    ...getUserProfile(user),
    onlineStatus:
      user.preferredOnlineStatus === "invisible"
        ? "offline"
        : user.preferredOnlineStatus
  };
  const friendRequests = user.friendRequests
    .filter((requester) => requester && requester.id != null)
    .map((requester) => getUserProfile(requester));
  const friends = user.friends
    .filter((friend) => friend && friend.id != null)
    .map((friend) => getUserProfile(friend));
  const directMessages = user.directMessages
    .filter((dm) => dm.user1 && dm.user2)
    .map((dm) => sterilizeClientDm(dm, user.id));
  const groupChats = user.groupChats.map((groupChat) =>
    sterilizeClientGroupChat(groupChat, user.id)
  );
  const servers = user.servers
    .filter((server) => server != null && server.server != null)
    .map((server) => ({
      uiOrder: server.uiOrder,
      server: sterilizeClientServer(server.server)
    }));
  const blockedUsers = user.blockedUsers
    .filter((blockedUser) => !!blockedUser)
    .map((blockedUser) => getUserProfile(blockedUser));

  return (
    <AuthContextProvider
      initialProfile={profile}
      initialFriendRequests={friendRequests}
      initialFriends={friends}
      initialDirectMessages={directMessages}
      initialGroupChats={groupChats}
      initialServers={servers}
      initialBlockedUsers={blockedUsers}
    >
      <VoiceCallContextProvider>
        <div className={styles["app-container"]}>
          <MainNavbar />
          {children}
        </div>
        <PopupMenuDisplay />
        <ModalDisplay />
      </VoiceCallContextProvider>
    </AuthContextProvider>
  );
}
