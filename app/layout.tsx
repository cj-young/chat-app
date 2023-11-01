import type { Metadata } from "next";
import "./globals.scss";
import { DM_Sans } from "next/font/google";
import Provider from "./Provider";
import { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "An app that lets you chat"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <Provider>
        <body>{children}</body>
      </Provider>
    </html>
  );
}
