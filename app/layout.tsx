import type { Metadata } from "next";
import "./globals.scss";
import { DM_Sans } from "next/font/google";
import Provider from "./Provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "An app that lets you chat"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <Provider>
        <body>{children}</body>
      </Provider>
    </html>
  );
}
