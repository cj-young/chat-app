import mongoose, { Schema, model, models, Document } from "mongoose";

export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 5; // 5 days

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
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

export default models.Session || model<ISession>("Session", sessionSchema);
