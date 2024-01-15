import ImageInput from "@/components/ImageInput";
import LoaderButton from "@/components/LoaderButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import ErrorIcon from "@/public/triangle-exclamation-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { FormEvent, useCallback, useState } from "react";
import styles from "./styles.module.scss";

export default function EditProfilePicture() {
  const { closeModal } = useUiContext();
  const { profile, setProfile } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState<File>();
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setNewProfilePicture(acceptedFiles[0]);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newProfilePicture) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("newProfilePicture", newProfilePicture);
      const res = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        return setErrorMessage(
          data.message ?? "An error occurred updating your profile picture"
        );
      }

      if (data.imageUrl) {
        setProfile((prev) => ({
          ...prev,
          imageUrl: data.imageUrl
        }));
      }

      closeModal();
    } catch (error) {
      setErrorMessage("An error occurred updating your profile picture");
      setIsLoading(false);
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Edit Profile Picture</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles["input-container"]}>
          <ImageInput
            onDrop={handleDrop}
            message="Click here or drag and drop a file to update your profile picture"
            activeImage={newProfilePicture}
          />
          <LoaderButton
            type="submit"
            loading={isLoading}
            disabled={!newProfilePicture}
          >
            Save
          </LoaderButton>
          {errorMessage && (
            <div className={styles["error"]}>
              <ErrorIcon />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
