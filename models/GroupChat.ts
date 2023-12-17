import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";

export interface IGroupChat extends Document {
  members: Types.ObjectId[];
  unreadCounts: Map<Types.ObjectId, number>;
  latestMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const groupChatSchema = new Schema(
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
    }
  },
  { timestamps: true }
);

export default models.GroupChat ||
  model<IGroupChat>("GroupChat", groupChatSchema);
