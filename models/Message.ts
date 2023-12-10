import mongoose, { Schema, model, models } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chatRef: {
      type: String,
      enum: ["DirectMessage"],
      required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      refPath: "chatRef",
      required: true
    }
  },
  { timestamps: true }
);

export type TMessage = mongoose.InferSchemaType<typeof messageSchema>;

export default models.Message || model<TMessage>("Message", messageSchema);
