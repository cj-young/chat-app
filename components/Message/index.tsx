import { IClientMessage, ITempMessage } from "@/types/user";
import Linkify from "linkify-react";
import ProfilePicture from "../ProfilePicture";
import MessageImage from "./components/MediaImage";
import MessageVideo from "./components/MediaVideo";
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
          clickOpensMenu={true}
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
          {message.media && message.media.length > 0 && (
            <ul className={styles["media-images"]}>
              {message.media.map((media) =>
                media.type === "image" ? (
                  <MessageImage image={media} key={media.mediaUrl} />
                ) : media.type === "video" ? (
                  <MessageVideo
                    videoUrl={media.mediaUrl}
                    key={media.mediaUrl}
                  />
                ) : null
              )}
            </ul>
          )}
        </div>
      ) : (
        <div className={styles["content-container"]}>
          <Linkify
            as="span"
            className={[
              styles["content"],
              isTemp ? styles["temp-content"] : ""
            ].join(" ")}
          >
            {message.content}
          </Linkify>
          {message.media && message.media.length > 0 && (
            <ul className={styles["media-images"]}>
              {message.media.map((media) =>
                media.type === "image" ? (
                  <MessageImage image={media} key={media.mediaUrl} />
                ) : media.type === "video" ? (
                  <MessageVideo
                    videoUrl={media.mediaUrl}
                    key={media.mediaUrl}
                  />
                ) : null
              )}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
