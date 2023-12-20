import { ReactNode } from "react";
import MainNavbar from "../components/MainNavbar";
import Sidebar from "./components/Sidebar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MainNavbar />
      <Sidebar />
      {children}
    </>
  );
}
