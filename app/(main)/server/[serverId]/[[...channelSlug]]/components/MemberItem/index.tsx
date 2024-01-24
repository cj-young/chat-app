"use client";
import ProfilePicture from "@/components/ProfilePicture";
import ProfileModal from "@/components/ProfilePicture/components/ProfileModal";
import { useUiContext } from "@/contexts/UiContext";
import { IClientMember } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  member: IClientMember;
}

export default function ServerMemberItem({ member: { user } }: Props) {
  const { addModal } = useUiContext();

  function handleClick() {
    addModal(<ProfileModal user={user} />);
  }

  return (
    <div className={styles["member-item"]} onClick={handleClick}>
      <ProfilePicture user={user} status={user.onlineStatus} />
      <span className={styles["member-name"]}>{user.displayName}</span>
    </div>
  );
}
