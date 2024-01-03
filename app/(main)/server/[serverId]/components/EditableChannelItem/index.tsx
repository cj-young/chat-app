import { IClientChannel } from "@/types/server";
import ChannelItem from "../ChannelItem";

interface Props {
  channel: IClientChannel;
}

export default function EditableChannelItem({ channel }: Props) {
  return <ChannelItem channel={channel} />;
}
