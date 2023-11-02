import { getServerSession } from "next-auth";
import styles from "./page.module.scss";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!session.user.verified) {
    redirect("/signup");
  }

  return <main>Home</main>;
}
