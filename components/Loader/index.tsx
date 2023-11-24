import React, { HTMLAttributes } from "react";
import styles from "./styles.module.scss";

export default function Loader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles["loader"], className].join(" ")} {...rest}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
