import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password?: string;
  email: string;
  googleId?: string;
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  servers: mongoose.Types.ObjectId[];
  imageURL?: string;
  checkPassword(): Promise<boolean>;
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
      unique: true
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
          type: Schema.Types.ObjectId,
          ref: "Server",
          required: true
        }
      ],
      default: []
    },
    imageURL: {
      type: String
    }
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default models.User || model<IUser>("User", userSchema);
