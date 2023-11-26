import MainNavbar from "@/app/(main)/components/MainNavbar";
import Sidebar from "@/app/(main)/components/Sidebar";
import AuthContextProvider from "@/contexts/AuthContext";
import { getSessionUser } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import styles from "./layout.module.scss";

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  try {
    const sessionId = cookies().get("session")?.value;

    if (!sessionId || sessionId[0] !== "1") {
      redirect("/login");
    }
    await dbConnect();

    const user = await getSessionUser(sessionId.slice(1));

    if (!user) {
      redirect("/login");
    }

    const profile = {
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      imageUrl: user.imageUrl
    };

    return (
      <AuthContextProvider initialProfile={profile}>
        <div className={styles["app-container"]}>
          <MainNavbar />
          <Sidebar />
          {children}
        </div>
      </AuthContextProvider>
    );
  } catch (error) {
    redirect("/login");
  }
}
