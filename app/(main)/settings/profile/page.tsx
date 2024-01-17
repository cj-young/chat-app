"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import ProfilePicture from "@/components/ProfilePicture";
import DoNotDisturbIcon from "@/components/svgs/DoNotDisturbIcon";
import IdleIcon from "@/components/svgs/IdleIcon";
import OfflineIcon from "@/components/svgs/OfflineIcon";
import OnlineIcon from "@/components/svgs/OnlineIcon";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { formatOnlineStatus } from "@/lib/user";
import EditIcon from "@/public/pen-to-square-solid.svg";
import EditDisplayName from "../components/EditDisplayName";
import EditOnlineStatus from "../components/EditOnlineStatus";
import EditProfilePicture from "../components/EditProfilePicture";
import EditUsername from "../components/EditUsername";
import styles from "./page.module.scss";

export default function ProfileSettings() {
  const { profile } = useAuthContext();
  const { addModal } = useUiContext();

  function editDisplayName() {
    addModal(<EditDisplayName />);
  }

  function editUsername() {
    addModal(<EditUsername />);
  }

  function editProfilePicture() {
    addModal(<EditProfilePicture />);
  }

  function editOnlineStatus() {
    addModal(<EditOnlineStatus />);
  }

  return (
    <>
      <div className={styles["title"]}>
        <MobileNavToggle />
        <h2>Profile</h2>
      </div>
      <section className={styles["profile-info"]}>
        <div className={styles["left-info"]}>
          <div className={styles["info-container"]}>
            <h3 className={styles["info-subtitle"]}>Display Name</h3>
            <div className={styles["info"]}>
              <span className={styles["display-name"]}>
                {profile.displayName}
              </span>
              <button
                className={styles["edit-button"]}
                onClick={editDisplayName}
              >
                <EditIcon />
              </button>
            </div>
          </div>
          <div className={styles["info-container"]}>
            <h3 className={styles["info-subtitle"]}>Username</h3>
            <div className={styles["info"]}>
              <span className={styles["username"]}>{profile.username}</span>
              <button className={styles["edit-button"]} onClick={editUsername}>
                <EditIcon />
              </button>
            </div>
          </div>
          <div className={styles["info-container"]}>
            <h3 className={styles["info-subtitle"]}>Online Status</h3>
            <div className={styles["info"]}>
              {profile.onlineStatus === "online" ? (
                <OnlineIcon className={styles["status-icon"]} />
              ) : profile.onlineStatus === "doNotDisturb" ? (
                <DoNotDisturbIcon className={styles["status-icon"]} />
              ) : profile.onlineStatus === "idle" ? (
                <IdleIcon className={styles["status-icon"]} />
              ) : (
                <OfflineIcon className={styles["status-icon"]} />
              )}
              <span className={styles["online-status"]}>
                {profile.onlineStatus === "offline"
                  ? "Invisible"
                  : formatOnlineStatus(profile.onlineStatus)}
              </span>
              <button
                className={styles["edit-button"]}
                onClick={editOnlineStatus}
              >
                <EditIcon />
              </button>
            </div>
          </div>
        </div>
        <div className={styles["profile-picture-container"]}>
          <ProfilePicture
            user={profile}
            className={styles["profile-picture"]}
          />
          <button
            className={styles["change-profile-picture"]}
            onClick={editProfilePicture}
          >
            Edit Picture
          </button>
        </div>
      </section>
    </>
  );
}
