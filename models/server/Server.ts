import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";
import defaultServerPictures from "./defaultServerPictures";

export interface IServer extends Document {
  name: string;
  members: Types.ObjectId[];
  channelGroups: {
    name: string;
    channels: Types.ObjectId[];
  }[];
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Member",
          required: true
        }
      ],
      default: []
    },
    channelGroups: {
      type: [
        {
          name: String,
          channels: [
            {
              type: Schema.Types.ObjectId,
              ref: "Channel",
              required: true
            }
          ]
        }
      ],
      default: []
    },
    imageUrl: {
      type: String,
      required: true,
      default: () =>
        defaultServerPictures[
          Math.floor(Math.random() * defaultServerPictures.length)
        ]
    }
  },
  { timestamps: true }
);

export default models.Server || model<IServer>("Server", serverSchema);
