"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import EditIcon from "@/public/pen-to-square-solid.svg";
import EditDisplayName from "../components/EditDisplayName";
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

  return (
    <>
      <div className={styles["title"]}>
        <MobileNavToggle />
        <h2>Profile</h2>
      </div>
      <section className={styles["profile-info"]}>
        <div className={styles["names"]}>
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
        </div>
        <div className={styles["profile-picture-container"]}>
          <ProfilePicture
            user={profile}
            className={styles["profile-picture"]}
          />
          <button className={styles["change-profile-picture"]}>
            Edit Picture
          </button>
        </div>
      </section>
    </>
  );
}
