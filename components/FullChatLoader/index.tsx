"use client";
import { useUiContext } from "@/contexts/UiContext";
import LoaderChatContainer from "./components/ChatContainer";
import LoaderInput from "./components/LoaderInput";
import LoaderNavbar from "./components/LoaderNavbar";
import styles from "./styles.module.scss";

export default function FullChatLoader() {
  const { mobileNavExpanded } = useUiContext();

  return (
    <main
      className={[
        styles["chat-loader-container"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <LoaderNavbar />
      <LoaderChatContainer />
      <LoaderInput />
    </main>
  );
}
