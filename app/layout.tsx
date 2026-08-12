import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { APP_NAME, APP_TAGLINE, SITE_URL } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Plant real trees. Track their growth, receive proof, get a permanent tree ID, and build your personal forest with verified planters.",
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      "Plant real trees, sponsor planting missions, and grow your own digital forest. Proof, verification, and a permanent tree ID for every tree.",
    url: SITE_URL,
    siteName: APP_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}