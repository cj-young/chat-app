"use client";
import { useServer } from "@/contexts/ServerContext";
import { formattedServerRoles, serverRolePriorities } from "@/lib/clientUtils";
import XIcon from "@/public/xmark-solid.svg";
import { IClientMember, TRole } from "@/types/server";
import { useMemo } from "react";
import ServerMemberItem from "../MemberItem";
import styles from "./styles.module.scss";

interface Props {
  toggleMenu(): void;
}

export default function ServerMemberList({ toggleMenu }: Props) {
  const { members } = useServer();

  const groupedMembers = useMemo(() => {
    const rolesMap = new Map<TRole, IClientMember[]>();
    for (let member of members) {
      if (!rolesMap.has(member.role)) {
        rolesMap.set(member.role, []);
      }
      rolesMap.get(member.role)!.push(member);
    }

    const rolesArray: { role: TRole; members: IClientMember[] }[] = [];
    for (let role of rolesMap.keys()) {
      rolesArray.push({ role, members: rolesMap.get(role) ?? [] });
    }
    return rolesArray.sort(
      (a, b) =>
        (serverRolePriorities.get(a.role) ?? 0) -
        (serverRolePriorities.get(b.role) ?? 0)
    );
  }, [members]);

  return (
    <div className={styles["container"]}>
      <h2 className={styles["title"]}>Members</h2>
      <button className={styles["mobile-close-menu"]} onClick={toggleMenu}>
        <XIcon />
      </button>
      <ul className={styles["member-list"]}>
        {groupedMembers.map((memberGroup) => (
          <li className={styles["member-group"]} key={memberGroup.role}>
            <h3 className={styles["role-name"]}>
              {formattedServerRoles.get(memberGroup.role)}
            </h3>
            <ul className={styles["member-sublist"]}>
              {memberGroup.members.map((member) => (
                <ServerMemberItem member={member} key={member.user.id} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
