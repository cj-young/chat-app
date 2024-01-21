import { useEffect, useRef } from "react";

export default function useVideoPreview(videoUrl: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoUrl;
    const onLoad = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      video.currentTime = 1;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0);
    };
    video.addEventListener("loadeddata", onLoad);
    return () => video.removeEventListener("loadeddata", onLoad);
  }, [videoUrl]);

  return canvasRef;
}
