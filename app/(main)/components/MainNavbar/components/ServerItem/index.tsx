"use client";
import { IClientServer } from "@/types/server";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface Props {
  server: IClientServer;
  isActive?: boolean;
}

export default function ServerItem({ server, isActive = false }: Props) {
  const router = useRouter();
  function handleClick() {
    router.push(`/server/${server.serverId}`);
  }

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: server.serverId,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  return (
    <li
      className={[
        styles["server-item"],
        isActive ? styles["selected"] : ""
      ].join(" ")}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <div
        className={styles["server-button"]}
        style={{
          backgroundImage: isDragging ? "unset" : `url(${server.imageUrl})`,
          backgroundSize: "cover",
          backgroundColor: isDragging ? "var(--bg-main)" : "unset"
        }}
        onClick={handleClick}
      ></div>
    </li>
  );
}
