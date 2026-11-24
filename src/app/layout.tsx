import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PassGuard OS | Next-Gen Campus Gate Pass System",
  description: "Enterprise Hostel & Campus Gate Pass Management System with Real-Time TOTP QR Verification, Multi-Hostel Workflows, and Parent Consent Automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ambient-mesh min-h-screen flex flex-col antialiased selection:bg-rose-500/20 selection:text-rose-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
