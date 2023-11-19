import mongoose, { Schema, model, models, Document } from "mongoose";

export const SESSION_EXPIRY_SECONDS = 60 * 30; // 30 minutes

export interface ISignupSession extends Document {
  user: mongoose.Types.ObjectId;
  password: string;
  email: string;
  isExpired(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const signupSessionSchema = new Schema<ISignupSession>(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

signupSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: SESSION_EXPIRY_SECONDS }
);

signupSessionSchema.methods.isExpired = function () {
  return this.createdAt.getTime() + SESSION_EXPIRY_SECONDS < Date.now();
};

export default models.SignupSession ||
  model<ISignupSession>("SignupSession", signupSessionSchema);
