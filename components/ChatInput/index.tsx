"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import PlusCircleIcon from "@/public/circle-plus-solid.svg";
import SendIcon from "@/public/paper-plane-solid.svg";
import { TMediaType, TMessageMedia } from "@/types/message";
import { ITempMessage } from "@/types/user";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { v4 } from "uuid";
import ImagePreview from "./components/ImagePreview";
import styles from "./styles.module.scss";

interface Props {
  chatName: string;
  submitRoute: string;
  addTempMessage(message: ITempMessage): void;
}

type TMediaFile = {
  type: TMediaType;
  file: File;
  id: string;
};

type TMediaPreview = TMessageMedia & {
  id: string;
};

export default function ChatInput({
  chatName,
  submitRoute,
  addTempMessage
}: Props) {
  const [message, setMessage] = useState("");
  const { profile } = useAuthContext();
  const [mediaFiles, setMediaFiles] = useState<TMediaFile[]>([]);

  const mediaPreviews = useMemo(() => {
    return mediaFiles.map<TMediaPreview>((mediaFile) => ({
      type: mediaFile.type,
      mediaUrl: URL.createObjectURL(mediaFile.file),
      id: mediaFile.id
    }));
  }, [mediaFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": []
    }
  });

  const { onClick: handleFileClick, ...rootProps } = getRootProps();

  function handleDrop(acceptedFiles: File[]) {
    const parsedFiles = acceptedFiles
      .map((file) => {
        const fileType = file.type.split("/")[0];
        if (
          fileType !== "video" &&
          fileType !== "audio" &&
          fileType !== "image"
        ) {
          return null;
        }
        return {
          type: fileType,
          file,
          id: v4()
        } as TMediaFile;
      })
      .filter((file): file is TMediaFile => !!file);

    setMediaFiles((prev) => [...prev, ...parsedFiles]);
  }

  async function sendMessage(e?: FormEvent) {
    if (e) e.preventDefault();
    const tempId = v4();
    addTempMessage({
      content: message,
      sender: profile,
      id: tempId,
      timestamp: new Date()
    });
    const formData = new FormData();
    formData.set("content", message);
    formData.set("tempId", tempId);
    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append("media", mediaFiles[i].file);
    }
    setMessage("");
    setMediaFiles([]);
    await fetch(
      `/api/${
        submitRoute.startsWith("/") ? submitRoute.slice(1) : submitRoute
      }`,
      {
        method: "POST",
        body: formData
      }
    );
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function removeFile(id: string) {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id));
  }

  return (
    <form
      className={styles["input-form"]}
      onSubmit={sendMessage}
      {...rootProps}
    >
      <input type="file" {...getInputProps()} />
      <div className={styles["input-container"]}>
        {mediaPreviews.length > 0 && (
          <div className={styles["media-previews"]}>
            {mediaPreviews.some(
              (preview) => preview.type === "image" || preview.type === "video"
            ) && (
              <ul className={styles["image-video-previews"]}>
                {mediaPreviews
                  .filter(
                    (preview) =>
                      preview.type === "image" || preview.type === "video"
                  )
                  .map((preview) => (
                    <ImagePreview
                      imageUrl={preview.mediaUrl}
                      remove={() => removeFile(preview.id)}
                      key={preview.id}
                    />
                  ))}
              </ul>
            )}
          </div>
        )}
        <div className={styles["input-bottom"]}>
          <button
            className={styles["media-input"]}
            onClick={handleFileClick}
            type="button"
          >
            <PlusCircleIcon />
          </button>
          <TextareaAutosize
            placeholder={`Send a message to ${chatName}`}
            className={styles["input"]}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxRows={message.length > 0 ? 5 : 1}
            minRows={1}
            rows={1}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <button type="submit" className={styles["send-button"]}>
        <SendIcon />
      </button>
    </form>
  );
}
