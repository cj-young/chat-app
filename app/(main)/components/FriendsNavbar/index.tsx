"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import Plus from "@/public/plus-solid.svg";
import { FriendPage } from "@/types/friends";
import { Dispatch, SetStateAction } from "react";
import styles from "./styles.module.scss";

interface Props {
  setPage: Dispatch<SetStateAction<FriendPage>>;
  page: FriendPage;
}

export default function FriendsNavbar({ setPage, page }: Props) {
  const { friendRequests } = useAuthContext();

  return (
    <div className={styles["nav-container"]}>
      <h1 className={styles["title"]}>Friends</h1>
      <nav>
        <ul className={styles["nav-items"]}>
          <li className={styles["nav-link"]}>
            <button
              onClick={() => setPage("online")}
              className={page === "online" ? styles["selected"] : ""}
            >
              Online
            </button>
          </li>
          <li className={styles["nav-link"]}>
            <button
              onClick={() => setPage("all")}
              className={page === "all" ? styles["selected"] : ""}
            >
              All
            </button>
          </li>
          <li className={styles["nav-link"]}>
            <button
              onClick={() => setPage("pending")}
              className={page === "pending" ? styles["selected"] : ""}
            >
              Pending{" "}
              {friendRequests.length > 0 && (
                <NumberBadge number={friendRequests.length} />
              )}
            </button>
          </li>
          <li className={styles["nav-link"]}>
            <button
              onClick={() => setPage("blocked")}
              className={page === "blocked" ? styles["selected"] : ""}
            >
              Blocked
            </button>
          </li>
          <li className={styles["nav-link"]}>
            <button
              onClick={() => setPage("add")}
              className={styles["add-friend"]}
            >
              Add <Plus />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
