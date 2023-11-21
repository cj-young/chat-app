"use client";
import { ReactNode, createContext, useContext, useState } from "react";

interface IAuthContext {
  profile: IProfile | null;
}

interface IProfile {
  email: string;
  displayName: string;
  username: string;
  imageUrl: string;
}

interface Props {
  children: ReactNode;
  initialProfile: IProfile;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthContextProvider({
  children,
  initialProfile
}: Props) {
  const [profile, setProfile] = useState<IProfile>(initialProfile);

  return (
    <AuthContext.Provider value={{ profile }}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
