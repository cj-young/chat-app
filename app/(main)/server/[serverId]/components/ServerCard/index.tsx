"use client";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import CaretIcon from "@/public/caret-down-solid.svg";
import LeaveServerIcon from "@/public/right-from-bracket-solid.svg";
import InviteIcon from "@/public/share-solid.svg";
import TrashIcon from "@/public/trash-solid.svg";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InviteModal from "../InviteModal";
import styles from "./styles.module.scss";

export default function ServerCard() {
  const { serverInfo, role } = useServer();
  const { addModal, closeModal } = useUiContext();
  const [menuExpanded, setMenuExpanded] = useState(false);
  const router = useRouter();

  async function leaveServer() {
    try {
      const res = await apiFetch(
        `/server/leave/${serverInfo.serverId}`,
        "POST"
      );
      const data = await res.json();
      if (!res.ok) {
        return console.error(data.message);
      }
      router.push("/");
      closeModal();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteServer() {
    try {
      const res = await apiFetch(`/server/delete`, "DELETE", {
        serverId: serverInfo.serverId
      });
      const data = await res.json();
      if (!res.ok) {
        return console.error(data.message);
      }
      router.push("/");
      closeModal();
    } catch (error) {
      console.error(error);
    }
  }

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
          <li className={styles["dropdown-item"]}>
            <button
              className={styles["dropdown-button"]}
              onClick={() =>
                addModal(
                  <ConfirmationModal
                    confirmCallback={leaveServer}
                    title="Are you sure you want to leave this server?"
                    confirmMessage="Yes, leave"
                    cancelMessage="No, cancel"
                  />
                )
              }
            >
              <span>Leave Server</span>
              <LeaveServerIcon />
            </button>
          </li>
          {role === "owner" && (
            <li className={styles["dropdown-item"]}>
              <button
                className={styles["dropdown-button"]}
                onClick={() =>
                  addModal(
                    <ConfirmationModal
                      confirmCallback={deleteServer}
                      title="Are you sure you want to delete this server? This cannot be undone."
                      confirmMessage="Yes, delete it"
                      cancelMessage="No, cancel"
                    />
                  )
                }
              >
                <span>Delete Server</span>
                <TrashIcon />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
