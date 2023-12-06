"use client";
import Plus from "@/public/plus-solid.svg";
import { FriendPage } from "@/types/friends";
import { Dispatch, SetStateAction } from "react";
import styles from "./styles.module.scss";

interface Props {
  setPage: Dispatch<SetStateAction<FriendPage>>;
}

export default function FriendsNavbar({ setPage }: Props) {
  return (
    <div className={styles["nav-container"]}>
      <h1 className={styles["title"]}>Friends</h1>
      <nav>
        <ul className={styles["nav-items"]}>
          <li className={styles["nav-link"]}>
            <button onClick={() => setPage("online")}>Online</button>
          </li>
          <li className={styles["nav-link"]}>
            <button onClick={() => setPage("all")}>All</button>
          </li>
          <li className={styles["nav-link"]}>
            <button onClick={() => setPage("pending")}>Pending</button>
          </li>
          <li className={styles["nav-link"]}>
            <button onClick={() => setPage("blocked")}>Blocked</button>
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
