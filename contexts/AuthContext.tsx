"use client";
import { IProfile } from "@/types/user";
import { ReactNode, createContext, useContext, useState } from "react";

interface IAuthContext {
  profile: IProfile | null;
  friendRequests: IProfile[];
}

interface Props {
  children: ReactNode;
  initialProfile: IProfile;
  initialFriendRequests: IProfile[];
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthContextProvider({
  children,
  initialProfile,
  initialFriendRequests
}: Props) {
  const [profile, setProfile] = useState<IProfile>(initialProfile);
  const [friendRequests, setFriendRequests] = useState<IProfile[]>(
    initialFriendRequests
  );

  return (
    <AuthContext.Provider value={{ profile, friendRequests }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
