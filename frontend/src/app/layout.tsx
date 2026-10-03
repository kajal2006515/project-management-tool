import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FlowBoard — Collaborative Project Management Tool",
  description: "Organize tasks, assign work, and collaborate with your team in real time on beautiful, dynamic board layouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030014] text-slate-100">
        {children}
      </body>
    </html>
  );
}
