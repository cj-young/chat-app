import styles from "./styles.module.scss";

interface Props {
  number: number;
}

export default function NumberBadge({ number }: Props) {
  const display =
    number <= 0 ? "0" : number < 1000 ? number.toString() : "999+";

  return (
    <div
      className={[styles[`length-${display.length}`], styles["badge"]].join(
        " "
      )}
    >
      {display}
    </div>
  );
}
