import DirectMessage from "@/models/DirectMessage";
import GroupChat from "@/models/GroupChat";
import Message from "@/models/Message";
import Session from "@/models/Session";
import SignupSession from "@/models/SignupSession";
import User from "@/models/User";
import Channel from "@/models/server/Channel";
import Member from "@/models/server/Member";
import Server from "@/models/server/Server";
import mongoose from "mongoose";

import "server-only";
export const runtime = "nodejs";

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log("1");
  if (cached.conn) {
    console.log("2");
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("at least trying");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    console.log("4");
    cached.conn = await cached.promise;

    if (!cached.conn.models.User) {
      cached.conn.model("User", User);
    }

    if (!cached.conn.models.Session) {
      cached.conn.model("Session", Session);
    }

    if (!cached.conn.models.SignupSession) {
      cached.conn.model("SignupSession", SignupSession);
    }

    if (!cached.conn.models.Server) {
      cached.conn.model("Server", Server);
    }

    if (!cached.conn.models.Member) {
      cached.conn.model("Member", Member);
    }

    if (!cached.conn.models.Message) {
      cached.conn.model("Message", Message);
    }

    if (!cached.conn.models.DirectMessage) {
      cached.conn.model("DirectMessage", DirectMessage);
    }

    if (!cached.conn.models.GroupChat) {
      cached.conn.model("GroupChat", GroupChat);
    }

    if (!cached.conn.models.Channel) {
      cached.conn.model("Channel", Channel);
    }
  } catch (e) {
    cached.promise = null;
    console.error("This errored :(");
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
