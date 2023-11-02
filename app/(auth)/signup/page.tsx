"use client";
import styles from "./styles.module.scss";
import SignUpForm from "./SignUpForm";
import { redirect } from "next/navigation";
import CreateNameForm from "./CreateNameForm";
import { useSession } from "next-auth/react";

export default function SignUp() {
  const { data: session, status } = useSession();

  if (session?.user.verified) {
    redirect("/");
  }

  return (
    <div className={styles["sign-up"]}>
      {status !== "loading" && (
        <>
          <h1>Sign Up</h1>
          {session?.user ? <CreateNameForm /> : <SignUpForm />}
        </>
      )}
    </div>
  );
}
