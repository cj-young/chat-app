import { IClientChannel } from "@/types/server";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ChannelItem from "../ChannelItem";

interface Props {
  channel: IClientChannel;
  onDelete?(): void;
}

export default function EditableChannelItem({ channel, onDelete }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef
  } = useSortable({
    id: channel.channelId,
    data: {
      type: "channel"
    },
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  return (
    <ChannelItem
      channel={channel}
      isEditable={true}
      {...{
        style,
        setNodeRef,
        attributes,
        listeners,
        isDragging,
        setActivatorNodeRef,
        onDelete
      }}
    />
  );
}
