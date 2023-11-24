import { ButtonHTMLAttributes } from "react";
import styles from "./styles.module.scss";
import Loader from "../Loader";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
}

export default function LoaderButton({
  className,
  loading,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={[styles["button"], className].join(" ")}
      disabled={loading}
      {...rest}
    >
      {children}
      {loading && <Loader className={styles["loader"]} />}
    </button>
  );
}
