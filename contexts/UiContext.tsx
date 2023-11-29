"use client";
import { ReactNode, createContext, useContext, useState } from "react";

interface IUiContext {
  mobileNavExpanded: boolean;
  toggleMobileNav(): void;
}

interface Props {
  children: ReactNode;
}

const UiContext = createContext<IUiContext>({} as IUiContext);

export default function UiContextProvider({ children }: Props) {
  const [mobileNavExpanded, setMobileNavExpanded] = useState(false);

  function toggleMobileNav() {
    setMobileNavExpanded((prevMobileNavExpanded) => !prevMobileNavExpanded);
  }

  return (
    <UiContext.Provider value={{ mobileNavExpanded, toggleMobileNav }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUiContext() {
  return useContext(UiContext);
}
