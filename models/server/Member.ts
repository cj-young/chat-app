import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";

export interface IMember extends Document {
  user: Types.ObjectId;
  server: Types.ObjectId;
  role: "guest" | "admin" | "owner";
  channels: {
    channel: Types.ObjectId;
    unreadMessages: number;
  }[];
  lastChannel: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    server: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: true
    },
    role: {
      type: String,
      enum: ["guest", "admin", "owner"],
      default: "guest",
      required: true
    },
    channels: {
      type: [
        {
          channel: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true
          },
          unreadMessages: {
            type: Number,
            required: true,
            default: 0
          }
        }
      ],
      required: true,
      default: []
    },
    lastChannel: {
      type: Schema.Types.ObjectId,
      ref: "Channel"
    }
  },
  { timestamps: true }
);

export default models.Member || model<IMember>("Member", memberSchema);
