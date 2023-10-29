import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUnverifiedUser extends Document {
  password?: string;
  email: string;
  googleId?: string;
  checkPassword(): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUnverifiedUser>(
  {
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
    }
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default models.User || model<IUnverifiedUser>("User", userSchema);
