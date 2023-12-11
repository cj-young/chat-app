import UiContextProvider from "@/contexts/UiContext";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ReactNode } from "react";
import "./globals.scss";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "An app that lets you chat"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <UiContextProvider>
        <body>{children}</body>
      </UiContextProvider>
    </html>
  );
}
