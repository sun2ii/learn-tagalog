import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Kain na tayo — Tagalog",
  description: "Learn Tagalog by seeing the system and hearing tiny conversations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="flex-1 mx-auto w-full max-w-md md:max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
