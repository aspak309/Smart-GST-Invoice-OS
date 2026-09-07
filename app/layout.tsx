import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart GST",
  description:
    "A complete GST business workspace for invoices, documents, compliance and business operations.",
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
