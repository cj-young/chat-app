import ProfilePicture from "@/components/ProfilePicture";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function VoiceCallMember({ user }: Props) {
  return (
    <li className={styles["voice-call-member"]}>
      <ProfilePicture user={user} className={styles["profile-picture"]} />
      <span className={styles["display-name"]}>{user.displayName}</span>
    </li>
  );
}
