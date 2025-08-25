import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepairX - Your Trusted Repair Service Platform",
  description: "Connect with skilled technicians for electronics, appliances, automotive, and home maintenance repairs. Professional, reliable, and convenient repair services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
