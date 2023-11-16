import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISession extends Document {
  expiresAt: Date;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    expiresAt: {
      type: Date,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default models.Session || model<ISession>("Session", sessionSchema);
