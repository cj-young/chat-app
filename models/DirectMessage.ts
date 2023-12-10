import mongoose, { Schema, model, models } from "mongoose";

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

export type TDirectMessage = mongoose.InferSchemaType<
  typeof directMessageSchema
>;

export default models.DirectMessage ||
  model<TDirectMessage>("DirectMessage", directMessageSchema);
