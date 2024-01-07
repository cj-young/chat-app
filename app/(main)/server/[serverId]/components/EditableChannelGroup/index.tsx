import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import CaretIcon from "@/public/caret-down-solid.svg";
import GripIcon from "@/public/grip-solid.svg";
import PlusSymbol from "@/public/plus-solid.svg";
import { IClientChannelGroup } from "@/types/server";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import AddChannelModal from "../AddChannelModal";
import EditableChannelItem from "../EditableChannelItem";
import styles from "./styles.module.scss";

interface Props {
  channelGroup: IClientChannelGroup;
}

export default function EditableChannelGroup({
  channelGroup: { name, channels, id: groupId }
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { addModal } = useUiContext();
  const { serverInfo } = useServer();

  const sortedChannels = useMemo(() => {
    return channels.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channels]);

  const channelIds = useMemo(() => {
    return sortedChannels.map((channel) => channel.channelId);
  }, [sortedChannels]);

  function handleExpand() {
    setIsExpanded((prev) => !prev);
  }

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef
  } = useSortable({
    id: groupId,
    data: {
      type: "channelGroup"
    },
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  const { setNodeRef: addChannelSetNodeRef } = useDroppable({
    id: `add-${groupId}`,
    data: {
      type: "addChannelButton"
    }
  });

  return (
    <li
      className={[
        styles["channel-group"],
        isDragging ? styles["being-dragged"] : ""
      ].join(" ")}
      ref={setNodeRef}
      style={style}
    >
      <div className={styles["group-name-container"]} onClick={handleExpand}>
        <button
          className={[
            styles["toggle-shown"],
            isExpanded ? "" : styles["collapsed"]
          ].join(" ")}
        >
          <CaretIcon />
        </button>
        <h3 className={styles["group-name"]}>{name}</h3>
        <div
          className={styles["move-group-grip"]}
          onClick={(e) => e.preventDefault()}
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </div>
      </div>
      <ul className={styles["channel-list"]}>
        <SortableContext items={channelIds}>
          {isExpanded &&
            sortedChannels.map((channel) => (
              <EditableChannelItem channel={channel} key={channel.channelId} />
            ))}
        </SortableContext>
        <li
          className={styles["add-channel-container"]}
          ref={addChannelSetNodeRef}
        >
          <button
            className={styles["add-channel"]}
            onClick={() =>
              addModal(
                <AddChannelModal
                  groupName={name}
                  groupId={groupId}
                  serverId={serverInfo.serverId}
                />
              )
            }
          >
            <PlusSymbol />
            <span>Add channel</span>
          </button>
        </li>
      </ul>
    </li>
  );
}
