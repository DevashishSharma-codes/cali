import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const windrawFont = localFont({
  src: "../public/Windraw Aesthetic - Italic.otf",
  variable: "--font-windraw",
  display: "swap",
});
const cactusJackFont = localFont({
  src: "../public/Cactus-Jack-Alternate.ttf",
  variable: "--font-cactus-jack",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Picasso — The Infinite Spatial Canvas",
  description: "A minimal, elegant spatial canvas to sketch, think, and collaborate in real time.",
  icons: {
    icon: [
      { url: "/picasso-logo.png", type: "image/png" },
    ],
    apple: "/picasso-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/picasso-logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;600;700&family=Gloria+Hallelujah&family=Gochi+Hand&family=Patrick+Hand&family=Permanent+Marker&family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${windrawFont.variable} ${cactusJackFont.variable}`}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
