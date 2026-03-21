import type { Metadata } from "next";
import "./globals.css";
import { DesignSystemOverlay } from "@/components/dev/DesignSystemOverlay";
import { PwaInstallGate } from "@/components/pwa/PwaInstallGate";

const metadataBase =
  process.env.NEXT_PUBLIC_APP_URL &&
  process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: "ALEC.HQ",
  description: "Personal Command Center",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0d0d1a" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="ALEC.HQ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <PwaInstallGate>{children}</PwaInstallGate>
        <DesignSystemOverlay />
      </body>
    </html>
  );
}
