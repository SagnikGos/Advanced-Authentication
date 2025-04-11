import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth System",
  description: "Advanced Auth with Next.js + Node",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
