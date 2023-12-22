import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import FriendsIcon from "@/public/user-group-solid.svg";
import { usePathname, useRouter } from "next/navigation";
import styles from "./styles.module.scss";

export default function FriendsLink() {
  const { friendRequests } = useAuthContext();
  const pathname = usePathname();
  const isBeingViewd = pathname === "/";
  const { closeMobileNav } = useUiContext();
  const router = useRouter();

  function handleClick() {
    if (isBeingViewd) {
      closeMobileNav();
    } else {
      router.push("/");
    }
  }

  return (
    <button className={styles["friends"]} onClick={handleClick}>
      <FriendsIcon />
      <span>Friends</span>
      {friendRequests.length > 0 && (
        <NumberBadge
          number={friendRequests.length}
          className={styles["friends-notification-badge"]}
        />
      )}
    </button>
  );
}
