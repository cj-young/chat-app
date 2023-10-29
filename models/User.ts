import mongoose, { InferSchemaType, Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
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

type User = InferSchemaType<typeof userSchema>;

export default models.User || model<User>("User", userSchema);
