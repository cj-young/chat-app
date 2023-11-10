"use client";
import { apiFetch } from "@/lib/api";
import { ReactNode, createContext, useContext } from "react";

interface IAuthContext {}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthContextProvider({ children }: Props) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
