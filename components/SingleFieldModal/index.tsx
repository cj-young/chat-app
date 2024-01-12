import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../Input";
import LoaderButton from "../LoaderButton";
import styles from "./styles.module.scss";

interface Props {
  title?: string;
  message?: string;
  placeholder: string;
  submitButtonText?: string;
  zodSchema?: z.ZodAny;
}

export default function SingleFieldModal({
  title,
  message,
  placeholder,
  submitButtonText = "Submit",
  zodSchema
}: Props) {
  const { closeModal } = useUiContext();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError
  } = useForm({
    resolver: zodSchema ? zodResolver(zodSchema) : undefined
  });

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      {title && <h2 className={styles["title"]}>{title}</h2>}
      {message && <p className={styles["message"]}>{message}</p>}
      <div className={styles["input-container"]}>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <LoaderButton type="submit" loading={isLoading}>
          {submitButtonText}
        </LoaderButton>
      </div>
    </div>
  );
}
