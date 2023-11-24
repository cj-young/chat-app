import { InputHTMLAttributes, HTMLInputTypeAttribute, useState } from "react";
import styles from "./styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import EyeSlash from "@/public/eye-slash-solid.svg";
import Eye from "@/public/eye-solid.svg";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: HTMLInputTypeAttribute;
  error?: string;
}

export default function index({ type, className, error, ...rest }: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setPasswordVisible((prevPasswordVisible) => !prevPasswordVisible);
  }

  return (
    <div className={[styles["input-container"], className].join(" ")}>
      <div
        className={[
          styles["input-wrapper"],
          error ? styles["input-error"] : ""
        ].join(" ")}
      >
        <input
          type={type === "password" && passwordVisible ? "text" : type}
          className={styles["input"]}
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
      {error && (
        <div className={styles["error"]}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
