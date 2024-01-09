"use client";
import { useUiContext } from "@/contexts/UiContext";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./styles.module.scss";

interface Props {
  path: string;
  name: string;
}

export default function NavbarItem({ path, name }: Props) {
  const pathname = usePathname();
  const { closeMobileNav } = useUiContext();
  const router = useRouter();

  const isSelected = useMemo(() => {
    if (pathname.startsWith("/")) {
      return pathname.split("/")[2] === path;
    } else {
      return pathname.split("/")[1] === path;
    }
  }, [pathname]);

  function handleClick() {
    if (isSelected) {
      closeMobileNav();
    } else {
      router.push(`/settings/${path}`);
    }
  }

  return (
    <li className={styles["nav-item"]}>
      <button
        className={[
          styles["nav-button"],
          isSelected ? styles["selected"] : ""
        ].join(" ")}
        onClick={handleClick}
      >
        {name}
      </button>
    </li>
  );
}
