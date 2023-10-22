"use client";
import styles from "./styles.module.scss";
import SignUpForm from "./SignUpForm";

export default function SignUp() {
  return (
    <div className={styles["sign-up"]}>
      <h1>Sign Up</h1>
      <SignUpForm />
    </div>
  );
}
