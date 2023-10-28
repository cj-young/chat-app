import mongoose, { InferSchemaType, Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";

const unverifiedUserSchema = new Schema(
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

unverifiedUserSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

unverifiedUserSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

type User = InferSchemaType<typeof unverifiedUserSchema>;

export default models.user || model<User>("User", unverifiedUserSchema);
