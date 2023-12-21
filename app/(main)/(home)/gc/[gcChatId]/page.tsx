import { getSessionUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientGroupChat } from "@/lib/groupChat";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
import { IUser } from "@/models/User";
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
        members: { user: IUser; unreadMessages: number }[];
      }>("members.user")
    ]);

    if (!groupChat || !user) redirect("/");
    if (
      !groupChat.members.some((member) => member.user.id.toString() === user.id)
    )
      redirect("/");

    return (
      <GcChatContainer
        groupChat={sterilizeClientGroupChat(groupChat, user.id)}
      />
    );
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}
