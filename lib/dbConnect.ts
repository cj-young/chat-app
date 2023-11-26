import Session from "@/models/Session";
import SignupSession from "@/models/SignupSession";
import User from "@/models/User";
import mongoose from "mongoose";

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
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
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
