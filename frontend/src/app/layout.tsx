import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeverComfortBanner from "@/components/FeverComfortBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AegisCare | AI Health Triage & Specialist System",
  description: "Modern healthcare platform with Google Gemini AI triage, specialist matching, and Fever & Eye-Care Comfort mode for easy viewing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col justify-between">
              <div>
                <FeverComfortBanner />
                <Navbar />
                <main>{children}</main>
              </div>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
