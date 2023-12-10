import { Schema, Types, model, models } from "mongoose";

export interface IDirectMessage {
  name: string;
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  user1Unread: number;
  user2Unread: number;
}

const directMessageSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user1Unread: {
      type: Number,
      required: true,
      default: 0
    },
    user2Unread: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

export default models.DirectMessage ||
  model<IDirectMessage>("DirectMessage", directMessageSchema);
