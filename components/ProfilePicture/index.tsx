import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function ProfilePicture({ user }: Props) {
  return <img className={styles["profile-picture"]} src={user.imageUrl} />;
}
