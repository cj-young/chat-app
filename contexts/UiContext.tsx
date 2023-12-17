"use client";
import { ReactNode, createContext, useContext, useState } from "react";

interface IUiContext {
  mobileNavExpanded: boolean;
  toggleMobileNav(): void;
  popupMenu: ReactNode | null;
  addPopupMenu(element: ReactNode): void;
  closePopupMenu(): void;
  modal: ReactNode | null;
  addModal(element: ReactNode): void;
  closeModal(): void;
}

interface Props {
  children: ReactNode;
}

const UiContext = createContext<IUiContext>({} as IUiContext);

export default function UiContextProvider({ children }: Props) {
  const [mobileNavExpanded, setMobileNavExpanded] = useState(false);
  const [popupMenu, setPopupMenu] = useState<ReactNode | null>(null);
  const [modal, setModal] = useState<ReactNode | null>(null);

  function toggleMobileNav() {
    setMobileNavExpanded((prevMobileNavExpanded) => !prevMobileNavExpanded);
  }

  function addPopupMenu(element: ReactNode) {
    setPopupMenu(element);
  }

  function closePopupMenu() {
    setPopupMenu(null);
  }

  function addModal(modal: ReactNode) {
    setModal(modal);
  }

  function closeModal() {
    setModal(null);
  }

  return (
    <UiContext.Provider
      value={{
        mobileNavExpanded,
        toggleMobileNav,
        addPopupMenu,
        closePopupMenu,
        popupMenu,
        modal,
        addModal,
        closeModal
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUiContext() {
  return useContext(UiContext);
}
