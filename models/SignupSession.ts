import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISignupSession extends Document {
  expiresAt: Date;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISignupSession>(
  {
    expiresAt: {
      type: Date,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "UnverifiedUser"
    }
  },
  { timestamps: true }
);

export default models.Session ||
  model<ISignupSession>("UnverifiedUser", sessionSchema);
