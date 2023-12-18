import { getSessionUser, getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientGroupChat } from "@/lib/groupChat";
import { MESSAGE_COUNT, getMessages } from "@/lib/message";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
import { IUser } from "@/models/User";
import { IClientMessage } from "@/types/user";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GcChatContainer from "./components/GcChatContainer";

interface Props {
  params: {
    gcChatId: string;
  };
}

export default async function GcChat({ params }: Props) {
  try {
    const sessionId = cookies().get("session")?.value;

    await dbConnect();

    if (!sessionId || sessionId[0] !== "1") redirect("/login");
    if (!isValidObjectId(params.gcChatId)) redirect("/");

    const [user, groupChat] = await Promise.all([
      getSessionUser(sessionId.slice(1)),
      GroupChat.findById<IGroupChat>(params.gcChatId).populate<{
        members: IUser[];
      }>("members")
    ]);

    if (!groupChat || !user) redirect("/");
    if (!groupChat.members.some((member) => user.id)) redirect("/");

    const messages = await getMessages(groupChat.id, "GroupChat");

    const clientMessages: IClientMessage[] = messages.map((message) => ({
      content: message.content,
      sender: getUserProfile(message.sender),
      chatId: message.chat.toString(),
      timestamp: message.createdAt,
      id: message.id
    }));

    return (
      <GcChatContainer
        groupChat={sterilizeClientGroupChat(groupChat, user.id)}
        messages={clientMessages}
        allLoaded={clientMessages.length < MESSAGE_COUNT}
      />
    );
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}
