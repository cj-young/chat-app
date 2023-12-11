import { IClientMessage } from "@/types/user";
import ProfilePicture from "../ProfilePicture";
import styles from "./styles.module.scss";

interface Props {
  message: IClientMessage;
  isFirst: boolean;
}

export default function Message({ message, isFirst }: Props) {
  return (
    <li className={styles["message-item"]}>
      {isFirst ? (
        <ProfilePicture
          user={message.sender}
          className={styles["profile-picture"]}
        />
      ) : (
        <span className={styles["sent-at"]}>
          {message.timestamp.toLocaleTimeString("en-us", {
            hour: "numeric",
            minute: "numeric"
          })}
        </span>
      )}
      {isFirst ? (
        <div className={styles["first-of-group"]}>
          <div className={styles["info"]}>
            <span className={styles["sender-name"]}>
              {message.sender.displayName}
            </span>
            <span className={styles["sent-at-first"]}>
              {message.timestamp
                .toLocaleString("en-us", {
                  hour: "numeric",
                  minute: "numeric",
                  day: "numeric",
                  month: "numeric",
                  year: "numeric"
                })
                .replace(",", "")}
            </span>
          </div>
          <span className={styles["content"]}>{message.content}</span>
        </div>
      ) : (
        <span className={styles["content"]}>{message.content}</span>
      )}
    </li>
  );
}
