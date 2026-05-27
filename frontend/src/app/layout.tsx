import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeScope",
  description: "Algorithmic trading dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
