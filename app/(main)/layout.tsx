import "../globals.scss";
import { ReactNode } from "react";
import AuthContextProvider from "@/contexts/AuthContext";
import { getSessionUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";

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
        {children}
      </AuthContextProvider>
    );
  } catch (error) {
    redirect("/login");
  }
}