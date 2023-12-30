"use client";
import { pusherClient } from "@/lib/pusher";
import { Channel } from "pusher-js";
import { ReactNode, createContext, useContext, useRef } from "react";

interface IPusherContext {
  subscribeToEvent(
    channelId: string,
    eventId: string,
    callback: Function
  ): Channel;
  unsubscribeFromEvent(
    channelId: string,
    eventId: string,
    callback: Function
  ): void;
  joinAppChannel(): void;
  leaveAppChannel(): void;
}

interface Props {
  children: ReactNode;
}

type channel = {
  subscription: Channel;
  events: Map<string, Set<Function>>;
};

const PusherContext = createContext<IPusherContext>({} as IPusherContext);

export default function PusherContextProvider({ children }: Props) {
  const channels = useRef(new Map<string, channel>()).current;

  function subscribeToEvent(
    channelId: string,
    eventId: string,
    callback: Function
  ) {
    if (!channels.has(channelId)) {
      channels.set(channelId, {
        subscription: pusherClient.subscribe(channelId),
        events: new Map<string, Set<Function>>()
      });
    }

    const channel = channels.get(channelId)!;

    if (!channel.events.has(eventId)) {
      channel.events.set(eventId, new Set<Function>());
    }

    channel.subscription.bind(eventId, callback);
    channel.events.get(eventId)!.add(callback);

    return channel.subscription;
  }

  function unsubscribeFromEvent(
    channelId: string,
    eventId: string,
    callback: Function
  ) {
    const channel = channels.get(channelId);
    if (!channel) return;

    channel.subscription.unbind(eventId, callback);

    const event = channel.events.get(eventId);
    if (!event) return;

    event.delete(callback);
    if (event.size === 0) {
      channel.events.delete(eventId);

      if (channel.events.size === 0) {
        pusherClient.unsubscribe(channelId);
        channels.delete(channelId);
      }
    }
  }

  function joinAppChannel() {
    pusherClient.subscribe("presence-app");
    console.log("subscribed to app");
  }

  function leaveAppChannel() {
    pusherClient.unsubscribe("presence-app");
  }

  return (
    <PusherContext.Provider
      value={{
        subscribeToEvent,
        unsubscribeFromEvent,
        joinAppChannel,
        leaveAppChannel
      }}
    >
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  return useContext(PusherContext);
}
