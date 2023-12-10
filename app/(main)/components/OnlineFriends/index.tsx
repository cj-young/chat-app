import { useAuthContext } from "@/contexts/AuthContext";
import FriendItem from "../FriendItem";
import styles from "./styles.module.scss";

export default function OnlineFriends() {
  const { friends } = useAuthContext();

  const onlineFriends = friends.filter(
    (friend) => friend.onlineStatus === "online"
  );

  return (
    <div className={styles["online-friends"]}>
      <h2 className={styles["title"]}>Online Friends</h2>
      {onlineFriends.length > 0 ? (
        <ul className={styles["friends-list"]}>
          {onlineFriends.map((friend) => (
            <FriendItem user={friend} key={friend.username} />
          ))}
        </ul>
      ) : (
        <p className={styles["no-friends"]}>
          You have no friends online right now
        </p>
      )}
    </div>
  );
}
