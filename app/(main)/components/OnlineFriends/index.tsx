import { useAuthContext } from "@/contexts/AuthContext";
import FriendItem from "../FriendItem";
import styles from "./styles.module.scss";

export default function OnlineFriends() {
  const { friends } = useAuthContext();

  return (
    <div className={styles["online-friends"]}>
      <h2 className={styles["title"]}>Online Friends</h2>
      {friends.length > 0 ? (
        <ul className={styles["friends-list"]}>
          {friends.map((friend) =>
            friend.onlineStatus === "online" ? (
              <FriendItem user={friend} key={friend.username} />
            ) : null
          )}
        </ul>
      ) : (
        <p className={styles["no-friends"]}>
          Your online friends will appear here
        </p>
      )}
    </div>
  );
}
