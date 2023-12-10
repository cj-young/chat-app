import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { getSessionUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.scss";

interface Props {
  params: {
    dmChatId: string;
  };
}

const a = 1;

export default async function DmChat({ params }: Props) {
  try {
    const sessionId = cookies().get("session")?.value;

    await dbConnect();

    if (!sessionId || sessionId[0] !== "1") redirect("/login");
    if (!isValidObjectId(params.dmChatId)) redirect("/");

    const [user, directMessage] = await Promise.all([
      getSessionUser(sessionId.slice(1)),
      DirectMessage.findById<IDirectMessage>(params.dmChatId)
    ]);

    if (!directMessage || !user) redirect("/");
    if (
      directMessage.user1.toString() !== user.id &&
      directMessage.user2.toString() !== user.id
    ) {
      redirect("/");
    }

    return (
      <div className={styles["chat-page-container"]}>
        <Chat />
        <ChatInput
          chatName={params.dmChatId}
          submitRoute={`/dm/message/${params.dmChatId}`}
        />
      </div>
    );
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}
