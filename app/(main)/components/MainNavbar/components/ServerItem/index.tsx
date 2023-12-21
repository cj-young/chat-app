"use client";
import { IClientServer } from "@/types/server";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface Props {
  server: IClientServer;
}

export default function ServerItem({ server }: Props) {
  const router = useRouter();

  function handleClick() {
    router.push(`/server/${server.serverId}`);
  }

  return (
    <button
      className={styles["server-button"]}
      style={{
        backgroundImage: `url(${server.imageUrl})`,
        backgroundSize: "cover"
      }}
      onClick={handleClick}
    ></button>
  );
}
