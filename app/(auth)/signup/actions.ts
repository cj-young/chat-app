"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UnverifiedUser from "@/models/UnverifiedUser";
import User, { IUser } from "@/models/User";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

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

    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred, please try again" };
  }
}

interface NameInfo {
  displayName: string;
  username: string;
}

export async function createName({ displayName, username }: NameInfo) {
  try {
    console.log({ displayName, username });
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { error: "Invalid session" };
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return { error: "That username is taken" };
    }

    const oldUser = (await UnverifiedUser.findByIdAndDelete(
      session.user.id
    )) as IUser;

    console.log(session.user.id);

    await User.create({
      username,
      displayName,
      password: oldUser.password,
      email: oldUser.email,
      googleId: oldUser.googleId,
      imageURL: "placeholder" // Replace with link to default profile picture image
    });

    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred, please try again" };
  }
}
