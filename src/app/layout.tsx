import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ahas Gawwa | Catering & Fine Dining | Colombo & Western Province",
  description:
    "Premium catering services and fine dining restaurant by Ahas Gawwa in Sri Lanka. PHI & SLSI 14001 Certified.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0a0806] text-stone-100 dark:bg-[#0a0806] dark:text-stone-100 light:bg-[#faf8f5] light:text-stone-900 transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
