import { IClientMessage, ITempMessage } from "@/types/user";
import Linkify from "linkify-react";
import ProfilePicture from "../ProfilePicture";
import styles from "./styles.module.scss";

interface Props {
  message: IClientMessage | ITempMessage;
  isFirst: boolean;
  isTemp?: boolean;
}

export default function Message({ message, isFirst, isTemp }: Props) {
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
          <Linkify
            as="span"
            className={[
              styles["content"],
              isTemp ? styles["temp-content"] : ""
            ].join(" ")}
          >
            {message.content}
          </Linkify>
        </div>
      ) : (
        <Linkify
          as="span"
          className={[
            styles["content"],
            isTemp ? styles["temp-content"] : ""
          ].join(" ")}
        >
          {message.content}
        </Linkify>
      )}
    </li>
  );
}
