import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";
import defaultGroupChatPictures from "./defaultGroupChatPictures";

export interface IGroupChat extends Document {
  members: Types.ObjectId[];
  unreadCounts: Map<string, number>;
  latestMessageAt: Date;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const groupChatSchema = new Schema<IGroupChat>(
  {
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        }
      ],
      default: []
    },
    unreadCounts: {
      type: Map,
      of: Number
    },
    latestMessageAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    imageUrl: {
      type: String,
      required: true,
      default: () =>
        defaultGroupChatPictures[
          Math.floor(Math.random() * defaultGroupChatPictures.length)
        ]
    }
  },
  { timestamps: true }
);

export default models.GroupChat ||
  model<IGroupChat>("GroupChat", groupChatSchema);
