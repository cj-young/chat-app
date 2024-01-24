"use client";
import { getFormattedTimeFromSeconds } from "@/lib/clientUtils";
import PauseIcon from "@/public/pause-solid.svg";
import PlayIcon from "@/public/play-solid.svg";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState
} from "react";
import styles from "./styles.module.scss";

interface Props {
  url: string;
}

export default function AudioPlayer({ url }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(isDragging);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const audioRef = useRef<HTMLAudioElement>(null);
  isDraggingRef.current = isDragging;
  currentTimeRef.current = currentTime;
  durationRef.current = duration;

  function handleTogglePlaying() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.duration === audioRef.current.currentTime) {
        setCurrentTime(0);
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  const progressPercent =
    duration === 0 || currentTime === 0 ? 0 : (currentTime / duration) * 100;

  function moveSliderToX(xPos: number) {
    if (!sliderRef.current) return;

    const { left, right } = sliderRef.current.getBoundingClientRect();
    const percentFromLeft = (xPos - left) / (right - left);
    const constrainedPercent =
      percentFromLeft < 0 ? 0 : percentFromLeft > 1 ? 1 : percentFromLeft;
    const newCurrentTime = constrainedPercent * durationRef.current;
    setCurrentTime(newCurrentTime);
  }

  function handleSliderHandleMouseDown(e: ReactMouseEvent) {
    setIsDragging(true);
  }

  function handleSliderMouseDown(e: ReactMouseEvent) {
    moveSliderToX(e.clientX);
    setIsDragging(true);
  }

  useEffect(() => {
    const onMouseUp = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTimeRef.current;
      }
      setIsDragging(false);
    };
    document.addEventListener("mouseup", onMouseUp);

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      moveSliderToX(e.clientX);
    };
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const onTimeUpdate = () => {
      if (isDraggingRef.current) return;
      setCurrentTime((prev) => audioRef.current?.currentTime ?? prev);
    };

    const onDurationChange = () => {
      setDuration((prev) => audioRef.current?.duration ?? prev);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    audioRef.current.addEventListener("timeupdate", onTimeUpdate);
    audioRef.current.addEventListener("durationchange", onDurationChange);
    audioRef.current.addEventListener("ended", onEnded);

    return () => {
      if (!audioRef.current) return;
      audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
      audioRef.current.removeEventListener("durationchange", onDurationChange);
      audioRef.current.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className={styles["audio-player"]}>
      <audio src={url} ref={audioRef} />
      <button
        className={styles["toggle-playing"]}
        onClick={handleTogglePlaying}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div
        className={styles["slider"]}
        ref={sliderRef}
        onMouseDown={handleSliderMouseDown}
      >
        <div
          className={styles["slider-handle"]}
          style={{
            left: `calc(${progressPercent}%)`
          }}
          onMouseDown={handleSliderHandleMouseDown}
        ></div>
        <div
          className={styles["slider-trail"]}
          style={{
            right: `${100 - progressPercent}%`
          }}
        ></div>
      </div>
      <div className={styles["time-display"]}>
        <span className={styles["current-time-display"]}>
          {getFormattedTimeFromSeconds(Math.floor(currentTime))}
        </span>{" "}
        <span className={styles["time-separator"]}>/</span>
        <span className={styles["duration-display"]}>
          {getFormattedTimeFromSeconds(Math.floor(duration))}
        </span>
      </div>
    </div>
  );
}
