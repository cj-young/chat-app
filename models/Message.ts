import { TMessageMedia } from "@/types/message";
import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";

export interface IMessage extends Document {
  content: string;
  sender: Types.ObjectId;
  chatRef: "DirectMessage";
  chat: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  media?: TMessageMedia[];
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      default: ""
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chatRef: {
      type: String,
      enum: ["DirectMessage", "GroupChat", "Channel"],
      required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      refPath: "chatRef",
      required: true
    },
    media: {
      type: [
        {
          type: {
            type: String,
            required: true,
            enum: ["video", "audio", "image"]
          },
          mediaUrl: {
            type: String,
            required: true
          }
        }
      ]
    }
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>("Message", messageSchema);
