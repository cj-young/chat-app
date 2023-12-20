import PusherContextProvider from "@/contexts/PusherContext";
import UiContextProvider from "@/contexts/UiContext";
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.scss";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "An app that lets you chat"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <UiContextProvider>
        <PusherContextProvider>
          <body>{children}</body>
        </PusherContextProvider>
      </UiContextProvider>
    </html>
  );
}
