"use client";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import CaretIcon from "@/public/caret-down-solid.svg";
import InviteIcon from "@/public/share-solid.svg";
import { useState } from "react";
import InviteModal from "../InviteModal";
import styles from "./styles.module.scss";

export default function ServerCard() {
  const { serverInfo } = useServer();
  const { addModal } = useUiContext();
  const [menuExpanded, setMenuExpanded] = useState(false);

  return (
    <div className={styles["server-card"]} aria-expanded={menuExpanded}>
      <button
        className={[
          styles["button"],
          menuExpanded ? styles["menu-expanded"] : ""
        ].join(" ")}
        onClick={() => setMenuExpanded((prev) => !prev)}
      >
        <span>{serverInfo.name}</span>
        <CaretIcon />
      </button>
      {menuExpanded && (
        <ul className={styles["dropdown"]}>
          <li className={styles["dropdown-item"]}>
            <button
              className={styles["dropdown-button"]}
              onClick={() =>
                addModal(<InviteModal serverId={serverInfo.serverId} />)
              }
            >
              <span>Invite people</span>
              <InviteIcon />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
