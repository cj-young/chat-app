"use client";
import { usePusher } from "@/contexts/PusherContext";
import { useEffect } from "react";

export default function usePusherEvent(
  channel: string,
  event: string,
  callback: Function,
  deps?: any[]
) {
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  const depsArray = deps ?? [];

  useEffect(() => {
    subscribeToEvent(channel, event, callback);

    return () => unsubscribeFromEvent(channel, event, callback);
  }, depsArray);
}
