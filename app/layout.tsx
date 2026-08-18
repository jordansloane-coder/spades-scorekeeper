import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppBackground from "@/components/AppBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next's basePath config rewrites its own internal script/asset URLs automatically,
// but not string paths inside the metadata object — those need the GitHub Pages
// project-page prefix (/spades-scorekeeper) applied by hand. Empty on Netlify/Vercel.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: "Spades Scorekeeper",
  description: "A phone-based scorekeeper for the Bauer family's up-and-down Spades variant.",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spades',
  },
  icons: {
    icon: `${basePath}/icons/icon-192.png`,
    apple: `${basePath}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b3d2e',
};

const darkModeInit = `
(function () {
  try {
    var stored = localStorage.getItem('spades-dark-mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === null ? prefersDark : stored === 'true';
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeInit }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppBackground />
        {children}
      </body>
    </html>
  );
}
