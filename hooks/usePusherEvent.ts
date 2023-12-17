"use client";
import { usePusher } from "@/contexts/PusherContext";
import { useEffect } from "react";

export default function usePusherEvent(
  channel: string,
  event: string,
  callback: Function
) {
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  useEffect(() => {
    subscribeToEvent(channel, event, callback);

    return () => unsubscribeFromEvent(channel, event, callback);
  }, [channel, event, callback]);
}
