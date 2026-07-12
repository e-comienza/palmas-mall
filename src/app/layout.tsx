import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

export const dynamic = "force-dynamic";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: settings.seoDefaultTitle,
      template: settings.seoTitleTemplate,
    },
    description: settings.seoDefaultDesc,
    icons: { icon: settings.faviconUrl },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: settings.mallName,
      images: [{ url: settings.ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#066939",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth">
      <body className={`${figtree.variable} ${bricolage.variable} min-h-full antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
