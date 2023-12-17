import MainNavbar from "@/app/(main)/components/MainNavbar";
import Sidebar from "@/app/(main)/components/Sidebar";
import AuthContextProvider from "@/contexts/AuthContext";
import { getSessionUser, getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientDm } from "@/lib/directMessages";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import PopupMenuDisplay from "./components/PopupMenuDisplay";
import styles from "./layout.module.scss";

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  try {
    const sessionId = cookies().get("session")?.value;

    if (!sessionId || sessionId[0] !== "1") {
      redirect("/login");
    }
    await dbConnect();

    const user = await getSessionUser(sessionId.slice(1));

    if (!user) {
      redirect("/login");
    }

    const profile = getUserProfile(user);
    const friendRequests = user.friendRequests
      .filter((requester) => requester && requester.id != null)
      .map((requester) => getUserProfile(requester));
    const friends = user.friends
      .filter((friend) => friend && friend.id != null)
      .map((friend) => getUserProfile(friend));
    const directMessages = user.directMessages
      .filter((dm) => dm.user1 && dm.user2)
      .map((dm) => sterilizeClientDm(dm, user.id));

    return (
      <AuthContextProvider
        initialProfile={profile}
        initialFriendRequests={friendRequests}
        initialFriends={friends}
        initialDirectMessages={directMessages}
      >
        <div className={styles["app-container"]}>
          <MainNavbar />
          <Sidebar />
          {children}
        </div>
        <PopupMenuDisplay />
      </AuthContextProvider>
    );
  } catch (error) {
    console.error(error);
    redirect("/login");
  }
}
