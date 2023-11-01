import dbConnect from "@/lib/dbConnect";
import UnverifiedUser, { IUnverifiedUser } from "@/models/UnverifiedUser";
import User, { IUser } from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials, req) {
        try {
          const { identifier, password } = credentials as {
            identifier: string;
            password: string;
          };
          await dbConnect();

          const user = (await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
          })) as IUser;

          if (user) {
            const passwordIsCorrect = await user.checkPassword(password);
            return passwordIsCorrect
              ? {
                  username: user.username,
                  displayName: user.displayName,
                  email: user.email,
                  imageURL: user.imageURL,
                  id: user.id,
                  verified: true
                }
              : null;
          } else {
            const unverifiedUser = (await UnverifiedUser.findOne({
              $or: [{ username: identifier }, { email: identifier }]
            })) as IUnverifiedUser;
            if (!unverifiedUser) return null;
            const passwordIsCorrect = await unverifiedUser.checkPassword(
              password
            );
            return passwordIsCorrect
              ? {
                  email: unverifiedUser.email,
                  id: unverifiedUser.id,
                  verified: false
                }
              : null;
          }
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          user: user
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
