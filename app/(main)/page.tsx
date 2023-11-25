"use client";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Home() {
  const { profile } = useAuthContext();

  return (
    <main>
      <pre style={{ color: "black" }}>{JSON.stringify(profile)}</pre>
    </main>
  );
}
