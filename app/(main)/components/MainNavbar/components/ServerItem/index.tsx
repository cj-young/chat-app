"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { IClientServer } from "@/types/server";
import { useRouter } from "next/navigation";
import { MutableRefObject, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  server: IClientServer;
  draggedServerRef: MutableRefObject<string | null>;
}

export default function ServerItem({ server, draggedServerRef }: Props) {
  const router = useRouter();
  const { setServers, servers } = useAuthContext();
  const [isBeingDragged, setIsBeingDragged] = useState(false);

  function handleClick() {
    router.push(`/server/${server.serverId}`);
  }

  function handleDragStart() {
    draggedServerRef.current = server.serverId;
    setTimeout(() => {
      setIsBeingDragged(true);
    }, 0);
  }

  function handleDragEnd() {
    if (draggedServerRef.current === server.serverId) {
      const thisUiOrder = servers.find(
        (serverItem) => serverItem.server.serverId === server.serverId
      )?.uiOrder;
      if (thisUiOrder !== undefined) {
        apiFetch("/server/rearrange", "POST", {
          serverId: draggedServerRef.current,
          newUiOrder: thisUiOrder
        });
      }
    }
    draggedServerRef.current = null;
    setIsBeingDragged(false);
  }

  function handleDragEnter() {
    const draggedServerId = draggedServerRef.current;

    if (!draggedServerId || draggedServerId === server.serverId) return;

    setServers((prev) => {
      const draggedServer = prev.find(
        (serverItem) => serverItem.server.serverId === draggedServerId
      );
      const thisServer = prev.find(
        (serverItem) => serverItem.server.serverId === server.serverId
      );
      if (
        !draggedServer ||
        !thisServer ||
        draggedServer.server.serverId === thisServer.server.serverId
      )
        return prev;

      return prev.map((prevServer) => {
        if (prevServer.server.serverId === draggedServer.server.serverId) {
          return {
            ...prevServer,
            uiOrder: thisServer.uiOrder
          };
        } else if (
          prevServer.uiOrder > draggedServer.uiOrder &&
          prevServer.uiOrder <= thisServer.uiOrder
        ) {
          return {
            ...prevServer,
            uiOrder: prevServer.uiOrder - 1
          };
        } else if (
          prevServer.uiOrder < draggedServer.uiOrder &&
          prevServer.uiOrder >= thisServer.uiOrder
        ) {
          return {
            ...prevServer,
            uiOrder: prevServer.uiOrder + 1
          };
        }
        return prevServer;
      });
    });

    const currentUiOrder = servers.find(
      (serverItem) => serverItem.server.serverId === server.serverId
    )?.uiOrder;
    if (currentUiOrder === undefined) return;
  }

  return (
    <div
      className={styles["server-button"]}
      style={{
        backgroundImage: isBeingDragged ? "unset" : `url(${server.imageUrl})`,
        backgroundSize: "cover",
        backgroundColor: isBeingDragged ? "var(--bg-main)" : "unset"
      }}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      draggable
    ></div>
  );
}
