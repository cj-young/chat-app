import styles from "./styles.module.scss";
import SignUpForm from "./SignUpForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SignUp() {
  const session = await getServerSession();

  if (session?.user.verified) {
    redirect("/");
  }

  return (
    <div className={styles["sign-up"]}>
      <h1>Sign Up</h1>
      <SignUpForm />
    </div>
  );
}
