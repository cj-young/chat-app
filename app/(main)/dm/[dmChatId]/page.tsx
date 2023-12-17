import { getSessionUser, getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientDm } from "@/lib/directMessages";
import { MESSAGE_COUNT, getMessages } from "@/lib/message";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import { IUser } from "@/models/User";
import { IClientMessage } from "@/types/user";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DmChatContainer from "./components/DmChatContainer";

interface Props {
  params: {
    dmChatId: string;
  };
}

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
    if (!directMessage.user1 || !directMessage.user2) redirect("/");

    const isUser1 = directMessage.user1.id === user.id;
    const isUser2 = directMessage.user2.id === user.id;
    if (!isUser1 && !isUser2) {
      redirect("/");
    }

    const messages = await getMessages(directMessage.id, "DirectMessage");

    const clientMessages: IClientMessage[] = messages.map((message) => ({
      content: message.content,
      sender: getUserProfile(message.sender),
      chatId: message.chat.toString(),
      timestamp: message.createdAt,
      id: message.id
    }));

    return (
      <DmChatContainer
        directMessageChat={sterilizeClientDm(
          directMessage,
          isUser1 ? directMessage.user1.id : directMessage.user2.id
        )}
        messages={clientMessages}
        allLoaded={clientMessages.length < MESSAGE_COUNT}
      />
    );
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}
