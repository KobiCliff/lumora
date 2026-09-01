import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import  { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumora - Book Like a Business",
  description:
    "Booking software for Nigerian service businesses — braids, tutoring, detailing, any trade. Your own booking page, deposits against no-shows, every booking on record.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        {/* Light is the dashboard's designed default; OS-dark users still get
            the ink variant via enableSystem. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}