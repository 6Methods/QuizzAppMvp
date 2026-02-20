import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizFlow — Realtime Quiz App",
  description: "Interactive real-time quiz application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed -z-10 w-[400px] h-[400px] rounded-full opacity-60 -top-[100px] -right-[100px] bg-[radial-gradient(circle,rgba(86,100,245,0.08)_0%,transparent_70%)]" />
        <div className="fixed -z-10 w-[300px] h-[300px] rounded-full opacity-60 bottom-0 -left-[50px] bg-[radial-gradient(circle,rgba(76,217,100,0.05)_0%,transparent_70%)]" />
        {children}
      </body>
    </html>
  );
}
