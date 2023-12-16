"use client";
import HomeIcon from "@/public/house-solid.svg";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

export default function HomeButton() {
  const [lastHomePage, setLastHomePage] = useState("/");
  const pathname = usePathname();
  const router = useRouter();

  const isAtHome = isOnHomePage(pathname);

  useEffect(() => {
    if (isOnHomePage(pathname)) {
      setLastHomePage(pathname);
    } else {
      setLastHomePage(lastHomePage ?? "/");
    }
  }, [pathname]);

  function handleGoHome() {
    router.push(lastHomePage);
  }

  return (
    <button
      className={[
        styles["home-button"],
        isAtHome ? styles["home-selected"] : ""
      ].join(" ")}
      onClick={handleGoHome}
    >
      <HomeIcon />
    </button>
  );
}

function isOnHomePage(path: string) {
  return (
    !path || path.startsWith("/dm") || path.startsWith("/gc") || path === "/"
  );
}
