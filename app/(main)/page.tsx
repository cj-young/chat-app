"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import styles from "./page.module.scss";

export default function Home() {
  const { profile } = useAuthContext();

  return <main className={[styles["main"]].join(" ")}></main>;
}
