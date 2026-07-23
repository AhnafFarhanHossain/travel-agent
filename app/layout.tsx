import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@teispace/next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TripProvider } from "@/context/trip-details";
import { SessionProvider } from "next-auth/react";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Travel Agent",
  description:
    "AI Travel Agent is a travel planning application that uses AI to help you plan your trips with the power of Agentic AI to help you find the perfect trip spots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", dmSans.variable, "font-dm-sans")}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <TripProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <main>{children}</main>
            </ThemeProvider>
          </TripProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
