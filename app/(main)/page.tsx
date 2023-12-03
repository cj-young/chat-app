"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { useState } from "react";
import AddFriend from "./components/AddFriend";
import FriendsNavbar from "./components/FriendsNavbar";
import styles from "./page.module.scss";

type FriendPage = "online" | "all" | "pending" | "blocked" | "add";

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
      <FriendsNavbar />
      {friendPage === "add" ? <AddFriend /> : ""}
    </main>
  );
}
