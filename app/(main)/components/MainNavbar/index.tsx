"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import AddServerButton from "./components/AddServerButton";
import HomeButton from "./components/HomeButton";
import ServerItem from "./components/ServerItem";
import styles from "./styles.module.scss";

export default function MainNavbar() {
  const { mobileNavExpanded, closeMobileNav } = useUiContext();
  const { servers } = useAuthContext();
  const pathname = usePathname();
  const draggedServerRef = useRef<string | null>(null);
  const currentServerId: string | null = useMemo(() => {
    const splitPath = pathname
      .split("/")
      .filter((segment) => segment.length > 0);
    if (splitPath[0] !== "server") return null;
    return splitPath[1];
  }, [pathname]);

  useEffect(() => {
    closeMobileNav();
  }, [pathname]);

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
        {[...servers]
          .sort((a, b) => a.uiOrder - b.uiOrder)
          .map((server) => (
            <li
              key={server.server.serverId}
              className={[
                styles["nav-item"],
                server.server.serverId === currentServerId
                  ? styles["selected"]
                  : ""
              ].join(" ")}
            >
              <ServerItem
                server={server.server}
                draggedServerRef={draggedServerRef}
              />
            </li>
          ))}
        <li className={styles["nav-item"]}>
          <AddServerButton />
        </li>
      </ul>
    </nav>
  );
}
