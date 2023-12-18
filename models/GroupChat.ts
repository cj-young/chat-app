import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";
import defaultGroupChatPictures from "./defaultGroupChatPictures";

export interface IGroupChat extends Document {
  members: { user: Types.ObjectId; unreadMessages: number }[];
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
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
          },
          unreadMessages: {
            type: Number,
            required: true,
            default: 0
          }
        }
      ],
      default: []
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
