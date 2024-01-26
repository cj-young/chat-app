import { MutableRefObject } from "react";
import SkeletonMessage from "../SkeletonMessage";
import styles from "./styles.module.scss";

interface Props {
  innerRef?: MutableRefObject<HTMLDivElement | null>;
}

export default function ChatLoadingState({ innerRef }: Props) {
  return (
    <div className={styles["container"]} ref={innerRef}>
      <SkeletonMessage isFirstOfGroup={true} />
      <SkeletonMessage isFirstOfGroup={false} lines={3} width={100} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={70} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} width={25} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={30} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={10} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={50} />
      <SkeletonMessage isFirstOfGroup={true} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={100} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={80} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={30} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={30} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={35} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={80} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} width={50} />
      <SkeletonMessage isFirstOfGroup={true} />
      <SkeletonMessage isFirstOfGroup={false} lines={3} width={100} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={70} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} width={25} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={30} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={10} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={50} />
      <SkeletonMessage isFirstOfGroup={false} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} width={40} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={15} />
      <SkeletonMessage isFirstOfGroup={false} lines={3} width={80} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={60} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={25} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={45} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} />
      <SkeletonMessage isFirstOfGroup={true} lines={3} width={90} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={10} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={30} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={40} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={20} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={70} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} />
      <SkeletonMessage isFirstOfGroup={true} lines={3} width={95} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={50} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={55} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={35} />
      <SkeletonMessage isFirstOfGroup={false} lines={1} width={60} />
      <SkeletonMessage isFirstOfGroup={true} lines={2} width={15} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} />
      <SkeletonMessage isFirstOfGroup={false} lines={3} width={75} />
      <SkeletonMessage isFirstOfGroup={false} lines={2} width={20} />
      <SkeletonMessage isFirstOfGroup={true} lines={1} width={70} />
    </div>
  );
}
