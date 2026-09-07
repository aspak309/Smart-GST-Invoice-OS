import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMART GST",
  description: "Complete GST, Invoicing and Business Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
