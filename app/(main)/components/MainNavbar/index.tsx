"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { moveExplicitlyOrderedElement } from "@/lib/clientUtils";
import { IClientServer } from "@/types/server";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AddServerButton from "./components/AddServerButton";
import HomeButton from "./components/HomeButton";
import ServerItem from "./components/ServerItem";
import styles from "./styles.module.scss";

export default function MainNavbar() {
  const { mobileNavExpanded, closeMobileNav } = useUiContext();
  const { servers, setServers } = useAuthContext();
  const pathname = usePathname();
  const draggedServerRef = useRef<string | null>(null);
  const currentServerId: string | null = useMemo(() => {
    const splitPath = pathname
      .split("/")
      .filter((segment) => segment.length > 0);
    if (splitPath[0] !== "server") return null;
    return splitPath[1];
  }, [pathname]);
  const [draggedServer, setDraggedServer] = useState<IClientServer | null>(
    null
  );
  const [listDirection, setListDirection] = useState<"column" | "row">("row");
  const navListRef = useRef(null);

  const sortedServers = useMemo(() => {
    return [...servers].sort((a, b) => a.uiOrder - b.uiOrder);
  }, [servers]);

  const serverIds = useMemo(() => {
    return sortedServers.map((server) => server.server.serverId);
  }, [sortedServers]);

  useEffect(() => {
    closeMobileNav();
  }, [pathname]);

  function handleDragStart(e: DragStartEvent) {
    const { active } = e;
    const activeServer = servers.find(
      (server) => server.server.serverId === active.id
    );
    setDraggedServer(activeServer?.server ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeServer = servers.find(
      (server) => server.server.serverId === active.id
    );
    const overServer = servers.find(
      (server) => server.server.serverId === over.id
    );
    if (!activeServer || !overServer) return;

    setServers((prev) =>
      moveExplicitlyOrderedElement(
        prev,
        (server) => server.server.serverId === activeServer.server.serverId,
        overServer.uiOrder
      )
    );

    apiFetch("/server/rearrange", "POST", {
      serverId: activeServer.server.serverId,
      newUiOrder: overServer.uiOrder
    });
  }

  useEffect(() => {
    const onResize = () => {
      if (navListRef.current) {
        const flexDirection = getComputedStyle(
          navListRef.current
        ).flexDirection;
        if (flexDirection === "row") {
          setListDirection("row");
        } else {
          setListDirection("column");
        }
      }
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <nav
      className={[
        styles["nav"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        id="NavbarDnDContext"
      >
        <ul className={styles["nav-list"]} ref={navListRef}>
          <li className={styles["nav-item"]}>
            <HomeButton />
          </li>
          <SortableContext
            items={serverIds}
            id="NavbarSorableContext"
            strategy={
              listDirection === "row"
                ? horizontalListSortingStrategy
                : verticalListSortingStrategy
            }
          >
            {sortedServers.map((server) => (
              <ServerItem
                server={server.server}
                isActive={server.server.serverId === currentServerId}
                key={server.server.serverId}
              />
            ))}
          </SortableContext>
          <li className={styles["nav-item"]}>
            <AddServerButton />
          </li>
        </ul>
        <DragOverlay>
          {draggedServer && <ServerItem server={draggedServer} />}
        </DragOverlay>
      </DndContext>
    </nav>
  );
}
