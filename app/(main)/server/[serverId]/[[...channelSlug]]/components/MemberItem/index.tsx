import ProfilePicture from "@/components/ProfilePicture";
import { IClientMember } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  member: IClientMember;
}

export default function ServerMemberItem({ member: { user } }: Props) {
  return (
    <div className={styles["member-item"]}>
      <ProfilePicture user={user} status={user.onlineStatus} />
      <span className={styles["member-name"]}>{user.displayName}</span>
    </div>
  );
}
