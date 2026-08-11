import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeTube — Streaming, remixed",
  description: "A cinematic streaming platform for films, originals and creator stories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
