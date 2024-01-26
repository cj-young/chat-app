import styles from "./styles.module.scss";

interface Props {
  isFirstOfGroup: boolean;
  lines?: number;
  width?: number;
}

export default function SkeletonMessage({
  lines = 1,
  isFirstOfGroup,
  width = 100
}: Props) {
  lines = Math.max(lines, 1);
  if (width > 100) width = 100;
  if (width < 0) width = 0;

  return (
    <div className={styles["container"]}>
      {isFirstOfGroup ? (
        <div className={styles["profile-picture"]}></div>
      ) : (
        <div className={styles["dummy"]}></div>
      )}
      {isFirstOfGroup ? (
        <div className={styles["first-of-group"]}>
          <div className={styles["name"]}></div>
          <div
            className={styles["content"]}
            style={{
              height: `${lines * 1.25}rem`,
              width: `min(calc(${width}% - 1rem), ${(width / 100) * 32}rem)`
            }}
          ></div>
        </div>
      ) : (
        <div
          className={styles["content"]}
          style={{
            height: `${lines * 1.25}rem`,
            width: `min(calc(${width}% - 1rem), ${(width / 100) * 32}rem)`
          }}
        ></div>
      )}
    </div>
  );
}
