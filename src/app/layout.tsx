import type { Metadata, Viewport } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-exo2",
});

export const metadata: Metadata = {
  title: "Khan Agro Farm",
  description: "Khan Agro Farm Management System — আয়, ব্যয়, দান, বিনিয়োগ ট্র্যাকার",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Khan Agro",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${exo2.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#070b13] text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
