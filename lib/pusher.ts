import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  var pusherServer: PusherServer; // This must be a `var` and not a `let / const`
  var pusherClient: PusherClient;
}

if (!global.pusherServer) {
  global.pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID as string,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
    secret: process.env.PUSHER_SECRET as string,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    useTLS: true
  });
}

export const pusherServer = global.pusherServer;

if (!global.pusherClient) {
  global.pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY as string,
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: "/api/pusher/auth"
    }
  );
}

export const pusherClient = global.pusherClient;
