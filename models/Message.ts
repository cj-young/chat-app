import { Schema, Types, model, models } from "mongoose";

export interface IMessage {
  content: string;
  sender: Types.ObjectId;
  chatRef: string;
  chat: Types.ObjectId;
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
