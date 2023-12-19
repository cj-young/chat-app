"use client";
import CameraIcon from "@/public/camera-solid.svg";
import { useMemo } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import styles from "./styles.module.scss";

interface Props {
  onDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void;
  message: string;
  activeImage?: File;
}

export default function ImageInput({ onDrop, activeImage, message }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    }
  });

  const filePreview = useMemo(() => {
    if (activeImage) {
      return URL.createObjectURL(activeImage);
    } else {
      return null;
    }
  }, [activeImage]);

  return (
    <div
      {...getRootProps({
        className: [
          styles["container"],
          isDragActive ? styles["dragging"] : ""
        ].join(" ")
      })}
    >
      <input {...getInputProps()} />
      {activeImage && filePreview ? (
        <img
          src={filePreview}
          alt={activeImage.name}
          className={styles["image-preview"]}
        />
      ) : (
        <div
          className={[
            styles["background"],
            isDragActive ? styles["dragging"] : ""
          ].join(" ")}
        >
          <CameraIcon />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
