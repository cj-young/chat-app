import CheckIcon from "@/public/check-solid.svg";
import EyeSlash from "@/public/eye-slash-solid.svg";
import Eye from "@/public/eye-solid.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { HTMLInputTypeAttribute, InputHTMLAttributes, useState } from "react";
import { RefCallBack } from "react-hook-form";
import styles from "./styles.module.scss";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: HTMLInputTypeAttribute;
  error?: string;
  inputRef?: RefCallBack;
  successMessage?: string;
}

export default function Input({
  type,
  className,
  inputRef,
  error,
  successMessage,
  ...rest
}: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setPasswordVisible((prevPasswordVisible) => !prevPasswordVisible);
  }

  return (
    <div className={[styles["input-container"], className].join(" ")}>
      <div
        className={[
          styles["input-wrapper"],
          error
            ? styles["input-error"]
            : successMessage
            ? styles["input-success"]
            : ""
        ].join(" ")}
      >
        <input
          type={type === "password" && passwordVisible ? "text" : type}
          className={styles["input"]}
          ref={inputRef}
          {...rest}
        />
        {type === "password" && (
          <button
            className={styles["toggle-password"]}
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={`${passwordVisible ? "Hide" : "Show"} password`}
          >
            {passwordVisible ? <EyeSlash /> : <Eye />}
          </button>
        )}
      </div>
      {error ? (
        <div className={styles["error"]}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      ) : successMessage ? (
        <div className={styles["success-message"]}>
          <CheckIcon />
          <span>{successMessage}</span>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
