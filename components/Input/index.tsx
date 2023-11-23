import { InputHTMLAttributes } from "react";
import styles from "./styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: string;
  error?: string;
}

export default function index({ type, className, error, ...rest }: Props) {
  return (
    <div className={[styles["input-wrapper"], className].join(" ")}>
      <input
        type={type}
        className={[styles["input"], error ? styles["input-error"] : ""].join(
          " "
        )}
        {...rest}
      />
      {error && (
        <div className={styles["error"]}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
