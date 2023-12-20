"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import AddServerButton from "./components/AddServerButton";
import HomeButton from "./components/HomeButton";
import ServerItem from "./components/ServerItem";
import styles from "./styles.module.scss";

export default function MainNavbar() {
  const { mobileNavExpanded } = useUiContext();
  const { servers } = useAuthContext();

  return (
    <nav
      className={[
        styles["nav"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ul className={styles["nav-list"]}>
        <li className={styles["nav-item"]}>
          <HomeButton />
        </li>
        {servers.map((server) => (
          <ServerItem server={server.server} key={server.server.serverId} />
        ))}
        <li className={styles["nav-item"]}>
          <AddServerButton />
        </li>
      </ul>
    </nav>
  );
}
