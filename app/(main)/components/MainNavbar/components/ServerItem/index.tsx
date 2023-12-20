import { IClientServer } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  server: IClientServer;
}

export default function ServerItem({ server }: Props) {
  return (
    <button
      className={styles["server-button"]}
      style={{
        backgroundImage: `url(${server.imageUrl})`,
        backgroundSize: "cover"
      }}
    ></button>
  );
}
