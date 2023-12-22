import { Document, Schema, Types, model, models } from "mongoose";

import "server-only";
import defaultServerPictures from "./defaultServerPictures";

export interface IServer extends Document {
  name: string;
  members: Types.ObjectId[];
  channelGroups: {
    name: string;
    channels: { channel: Types.ObjectId; uiOrder: number }[];
    uiOrder: number;
  }[];
  imageUrl: string;
  homeChannel?: Types.ObjectId;
  inviteCode: { code: string; expiresAt: Date };
  isInviteExpired(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>(
  {
    name: {
      type: String,
      required: true
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
              channel: {
                type: Schema.Types.ObjectId,
                ref: "Channel",
                required: true
              },
              uiOrder: {
                type: Number,
                required: true
              }
            }
          ],
          uiOrder: {
            type: Number,
            required: true
          }
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
    },
    homeChannel: {
      type: Schema.Types.ObjectId,
      ref: "Channel"
    },
    inviteCode: {
      type: {
        code: {
          type: String,
          required: true
        },
        expiresAt: {
          type: Date,
          required: true
        }
      }
    }
  },
  { timestamps: true }
);

serverSchema.methods.isInviteExpired = function () {
  return (
    !this.inviteCode || Date.now() - this.inviteCode.expiresAt.getTime() >= 0
  );
};

export default models.Server || model<IServer>("Server", serverSchema);
