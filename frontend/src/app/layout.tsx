import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: "RepairX - Enterprise Repair Management Platform",
  description: "Professional SaaS platform for repair service management with advanced analytics, multi-role dashboards, and AI-powered features.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-inter antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
