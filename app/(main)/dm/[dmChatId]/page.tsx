import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { getSessionUser, getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import Message, { IMessage } from "@/models/Message";
import { IUser } from "@/models/User";
import { IClientMessage } from "@/types/user";
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
        .populate<{
          user1: IUser;
        }>("user1")
        .populate<{ user2: IUser }>("user2")
    ]);

    if (!directMessage || !user) redirect("/");

    const isUser1 = directMessage.user1.id === user.id;
    const isUser2 = directMessage.user2.id === user.id;
    if (!isUser1 && !isUser2) {
      redirect("/");
    }

    const messages = await Message.find<IMessage>({
      chatRef: "DirectMessage",
      chat: directMessage.id
    })
      .populate<{ sender: IUser }>("sender")
      // Sort by ID in case multiple documents have the same timestamp
      .sort([
        ["createdAt", "desc"],
        ["_id", "desc"]
      ])
      .limit(40);

    const clientMessages: IClientMessage[] = messages.map((message) => ({
      content: message.content,
      sender: getUserProfile(message.sender),
      chatId: message.chat.toString(),
      timestamp: message.createdAt
    }));

    return (
      <div className={styles["chat-page-container"]}>
        <Chat initialMessages={clientMessages} />
        <ChatInput
          chatName={
            isUser1
              ? directMessage.user2.displayName
              : directMessage.user1.displayName
          }
          submitRoute={`/dm/message/${params.dmChatId}`}
        />
      </div>
    );
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}
