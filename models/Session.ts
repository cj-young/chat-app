import mongoose, { Document, Schema, model, models } from "mongoose";

import "server-only";

export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 5; // 5 days

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  isExpired(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  { timestamps: true }
);

sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: SESSION_EXPIRY_SECONDS }
);

sessionSchema.methods.isExpired = function () {
  return this.createdAt.getTime() + SESSION_EXPIRY_SECONDS * 1000 < Date.now();
};

export default models.Session || model<ISession>("Session", sessionSchema);
