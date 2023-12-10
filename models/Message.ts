import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";

export interface IMessage extends Document {
  content: string;
  sender: Types.ObjectId;
  chatRef: string;
  chat: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chatRef: {
      type: String,
      enum: ["DirectMessage"],
      required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      refPath: "chatRef",
      required: true
    }
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>("Message", messageSchema);
