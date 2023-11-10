import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

interface VerifiedUser {
  username: string;
  displayName: string;
  email: string;
  imageUrl: string;
  id: string;
  verified: boolean;
}

interface UnverifiedUser {
  id: string;
  email: string;
  verified: boolean;
}

interface test {
  username?: string;
  displayName?: string;
  email: string;
  imageUrl?: string;
  id: string;
  verified: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
      displayName?: string;
      email: string;
      imageUrl?: string;
      id: string;
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    displayName?: string;
    email: string;
    imageUrl?: string;
    id: string;
    verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user?: {
      username?: string;
      displayName?: string;
      email: string;
      imageUrl?: string;
      id: string;
      verified: boolean;
    };
  }
}
