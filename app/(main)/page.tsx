"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { FriendPage } from "@/types/friends";
import { useState } from "react";
import AddFriend from "./components/AddFriend";
import AllFriends from "./components/AllFriends";
import FriendRequests from "./components/FriendRequests";
import FriendsNavbar from "./components/FriendsNavbar";
import styles from "./page.module.scss";

export default function Home() {
  const { profile } = useAuthContext();
  const { mobileNavExpanded } = useUiContext();
  const [friendPage, setFriendPage] = useState<FriendPage>("add");

  return (
    <main
      className={[
        styles["main"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <FriendsNavbar setPage={setFriendPage} />
      {friendPage === "add" ? (
        <AddFriend />
      ) : friendPage === "pending" ? (
        <FriendRequests />
      ) : friendPage === "all" ? (
        <AllFriends />
      ) : (
        ""
      )}
    </main>
  );
}
