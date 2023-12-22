"use client";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Props {
  chatId: string;
}

const CONFIRM_LEAVE_CHAT_MESSAGE = "Yes, leave";
const CANCEL_LEAVE_CHAT_MESSAGE = "No, cancel";
const MODAL_TITLE = "Are you sure you want to leave this chat?";

export default function LeaveChatModal({ chatId }: Props) {
  const { closeModal } = useUiContext();
  const router = useRouter();

  async function handleLeaveChat() {
    try {
      const res = await apiFetch(`/group-chat/leave/${chatId}`, "POST");
      const data = await res.json();
      closeModal();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ConfirmationModal
      confirmCallback={handleLeaveChat}
      confirmMessage={CONFIRM_LEAVE_CHAT_MESSAGE}
      cancelMessage={CANCEL_LEAVE_CHAT_MESSAGE}
      title={MODAL_TITLE}
    />
  );
}
