import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Travel Assistant Created with Love by Ancent Mbithi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        {children}
      </body>
    </html>
  );
}
