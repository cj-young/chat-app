import { TOnlineStatus } from "@/types/user";
import bcrypt from "bcrypt";
import mongoose, { Document, Schema, model, models } from "mongoose";
import defaultProfilePictures from "./defaultProfilePictures";

import "server-only";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password?: string;
  email: string;
  googleId?: string;
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  servers: { uiOrder: number; server: mongoose.Types.ObjectId }[];
  directMessages: mongoose.Types.ObjectId[];
  groupChats: mongoose.Types.ObjectId[];
  imageUrl: string;
  onlineStatus: TOnlineStatus;
  checkPassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: true
    },
    password: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    friends: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        }
      ],
      default: []
    },
    friendRequests: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        }
      ],
      default: []
    },
    servers: {
      type: [
        {
          uiOrder: {
            type: Number,
            required: true,
            default: 0
          },
          server: {
            type: Schema.Types.ObjectId,
            ref: "Server",
            required: true
          }
        }
      ],
      default: []
    },
    directMessages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "DirectMessage",
          required: true
        }
      ],
      default: []
    },
    groupChats: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "GroupChat",
          required: true
        }
      ],
      default: []
    },
    imageUrl: {
      type: String,
      required: true,
      default: () =>
        defaultProfilePictures[
          Math.floor(Math.random() * defaultProfilePictures.length)
        ]
    },
    onlineStatus: {
      type: String,
      enum: ["online", "offline", "idle", "doNotDisturb"],
      default: "offline"
    }
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default models.User || model<IUser>("User", userSchema);
