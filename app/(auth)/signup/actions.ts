"use server";

import dbConnect from "@/lib/dbConnect";
import UnverifiedUser from "@/models/UnverifiedUser";
import User from "@/models/User";
import bcrypt from "bcrypt";

interface Info {
  email: string;
  password: string;
  confirmPassword: string;
}

export async function signUp({ email, password, confirmPassword }: Info) {
  try {
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already in use" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UnverifiedUser.findOneAndUpdate(
      { email },
      {
        email,
        password: hashedPassword
      },
      { upsert: true }
    );

    return {};
  } catch (error) {
    console.error(error);
    return { error: "An error occurred, please try again" };
  }
}
