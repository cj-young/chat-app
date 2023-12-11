import Message from "@/components/Message";
import { IClientMessage } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  initialMessages: IClientMessage[];
}

export default function Chat({ initialMessages }: Props) {
  return (
    <ul className={styles["chat-container"]}>
      {initialMessages.map((message, i) => {
        let isInGroup = false;
        if (i < initialMessages.length - 1) {
          isInGroup =
            initialMessages[i].sender.id === initialMessages[i + 1].sender.id &&
            initialMessages[i].timestamp.getTime() -
              initialMessages[i + 1].timestamp.getTime() <
              5 * 60 * 1000; // True if messages are sent within 5 minutes
        }

        return (
          <Message message={message} isFirst={!isInGroup} key={message.id} />
        );
      })}
    </ul>
  );
}
