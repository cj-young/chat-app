import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";

export interface IChannel extends Document {
  server: Types.ObjectId;
  name: string;
  channelType: "text";
  latestMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    server: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    channelType: {
      type: String,
      enum: ["text"],
      default: "text",
      required: true
    },
    latestMessageAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default models.Channel || model<IChannel>("Channel", channelSchema);
