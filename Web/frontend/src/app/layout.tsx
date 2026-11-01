import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ProctorLens — Admin Portal",
    template: "%s | ProctorLens Admin",
  },
  description:
    "ProctorLens University Disciplinary & Case Management System — Administrator Portal. COMSATS University Islamabad.",
  keywords: ["ProctorLens", "Admin", "COMSATS", "University", "Disciplinary"],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ height: "100dvh", overflow: "hidden" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
