import styles from "./styles.module.scss";
import FormWrapper from "./forms/FormWrapper";
import { cookies } from "next/headers";
import { getSignupSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

export default async function SignUp() {
  let authStatus: "unauthenticated" | "signingUp";

  try {
    const sessionId = cookies().get("session")?.value;

    await dbConnect();

    if (sessionId && sessionId[0] === "0") {
      const session = await getSignupSession(sessionId.slice(1));

      if (!session) {
        authStatus = "unauthenticated";
      } else {
        authStatus = "signingUp";
      }
    } else {
      authStatus = "unauthenticated";
    }
  } catch (error) {
    authStatus = "unauthenticated";
  }

  return (
    <div className={styles["sign-up"]}>
      <>
        <h1>Sign Up</h1>
        <FormWrapper authStatus={authStatus} />
      </>
    </div>
  );
}
