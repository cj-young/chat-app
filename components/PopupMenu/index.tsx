"use client";
import { useUiContext } from "@/contexts/UiContext";
import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

interface Props {
  items: PopupMenuItem[];
  x: number;
  y: number;
}

export type PopupMenuItem = {
  content: string;
  onClick(): any;
};

export default function PopupMenu({ items, x, y }: Props) {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const { closePopupMenu } = useUiContext();

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        closePopupMenu();
      }
    };
    window.addEventListener("mousedown", onWindowClick);

    return () => {
      window.removeEventListener("mousedown", onWindowClick);
    };
  }, []);

  return (
    <ul
      className={styles["popup-menu"]}
      style={{ top: y, left: x }}
      ref={menuRef}
    >
      {items.map((item, i) => (
        <li key={i}>
          <button
            onClick={() => {
              closePopupMenu();
              item.onClick();
            }}
            className={styles["menu-button"]}
          >
            {item.content}
          </button>
        </li>
      ))}
    </ul>
  );
}
