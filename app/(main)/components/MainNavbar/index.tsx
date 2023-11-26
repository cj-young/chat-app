import styles from "./styles.module.scss";

export default function MainNavbar() {
  return <nav className={[styles["nav"], styles["hidden"]].join(" ")}></nav>;
}
