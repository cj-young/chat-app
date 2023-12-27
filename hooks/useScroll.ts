"use client";
import { useEffect, useRef } from "react";

export default function useScroll(onScrollEnter: () => void) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef?.current) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        onScrollEnter();
      }
    });
    observer.observe(scrollRef.current);

    return () => observer.disconnect();
  }, [onScrollEnter]);

  return { scrollRef };
}
