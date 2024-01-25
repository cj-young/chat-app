import Server, { IServer } from "@/models/server/Server";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

interface Props {
  params: {
    inviteCode: string;
  };
}

export default async function InvitePage({ params: { inviteCode } }: Props) {
  const server = await Server.findOne<IServer>({
    "inviteCode.code": inviteCode
  });
  if (!server || server.inviteCode.expiresAt.getTime() < Date.now()) {
    notFound();
  }

  return (
    <div className={styles["invite-page"]}>
      <div className={styles["invite-container"]}>
        <img src={server.imageUrl} className={styles["server-image"]} />
        <h2 className={styles["title"]}>
          You have been invited to join{" "}
          <span className={styles["server-name"]}>{server.name}</span>
        </h2>
        <div className={styles["buttons"]}>
          <button
            className={[styles["button"], styles["ignore-button"]].join(" ")}
          >
            <a href="#">Ignore</a>
          </button>
          <button
            className={[styles["button"], styles["join-button"]].join(" ")}
          >
            <a href={`/api/server/join/${inviteCode}`}>Join</a>
          </button>
        </div>
      </div>
    </div>
  );
}
