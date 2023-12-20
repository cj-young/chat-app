import { ReactNode } from "react";
import Sidebar from "./components/Sidebar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
