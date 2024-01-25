"use client";
import ProfilePicture from "@/components/ProfilePicture";
import ProfileModal from "@/components/ProfilePicture/components/ProfileModal";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { IClientMember } from "@/types/server";
import EditRoleModal from "../../../components/EditRoleModal";
import styles from "./styles.module.scss";

interface Props {
  member: IClientMember;
}

export default function ServerMemberItem({ member }: Props) {
  const { addModal } = useUiContext();
  const { user } = member;
  const { role, serverInfo } = useServer();

  function handleClick() {
    addModal(
      <ProfileModal
        user={user}
        member={member}
        canEditRole={role === "owner" && member.role !== "owner"}
        server={serverInfo}
        onEditRole={() => addModal(<EditRoleModal member={member} />)}
      />
    );
  }

  return (
    <div className={styles["member-item"]} onClick={handleClick}>
      <ProfilePicture user={user} status={user.onlineStatus} />
      <span className={styles["member-name"]}>{user.displayName}</span>
    </div>
  );
}
