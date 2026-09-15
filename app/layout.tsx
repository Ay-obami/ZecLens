import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZecPulse — Live Zcash Network Pulse",
  description:
    "Live Zcash mainnet intelligence for blocks, peers, mempool activity, network health, and privacy pools.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
