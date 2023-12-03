"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import styles from "./styles.module.scss";

export default function AddFriend() {
  return (
    <div className={styles["add-friend"]}>
      <h2 className={styles["title"]}>Add Friend</h2>
      <form className={styles["form"]}>
        <Input
          type="text"
          className={styles["input"]}
          placeholder="Add friend by username"
        />
        <LoaderButton loading={false}>Add Friend</LoaderButton>
      </form>
    </div>
  );
}
