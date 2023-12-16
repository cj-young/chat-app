"use client";
import { useUiContext } from "@/contexts/UiContext";

export default function PopupMenuDisplay() {
  const { popupMenu } = useUiContext();

  return popupMenu;
}
