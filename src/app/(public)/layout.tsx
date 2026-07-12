import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WhatsappFloat } from "@/components/public/whatsapp-float";
import { Molly } from "@/components/public/molly";
import { PopupManager, type PopupData } from "@/components/public/popup-manager";
import { getNavigation, getActivePopups } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, mainNav, popups] = await Promise.all([
    getSiteSettings(),
    getNavigation("main"),
    getActivePopups(),
  ]);

  const popupData: PopupData[] = popups.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    imageUrl: p.imageUrl,
    ctaLabel: p.ctaLabel,
    ctaUrl: p.ctaUrl,
    placement: p.placement,
    customPath: p.customPath,
    frequency: p.frequency,
    frequencyDays: p.frequencyDays,
    delaySeconds: p.delaySeconds,
    exitIntent: p.exitIntent,
    audience: p.audience,
  }));

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {settings.globalBannerActive && settings.globalBannerText ? (
        <div className="relative z-50 bg-palm-950 px-4 py-2 text-center text-sm font-medium text-white">
          {settings.globalBannerText}
        </div>
      ) : null}
      <Header
        navItems={mainNav.map((i) => ({ label: i.label, url: i.url }))}
        logoUrl={settings.logoUrl}
        mallName={settings.mallName}
        whatsapp={settings.whatsapp}
        instagramUrl={settings.instagramUrl}
        tiktokUrl={settings.tiktokUrl}
        facebookUrl={settings.facebookUrl}
      />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsappFloat whatsapp={settings.whatsapp} />
      <Molly
        config={{
          enabled: settings.mollyEnabled,
          imageUrl: settings.mollyImageUrl,
          message: settings.mollyMessage,
          ctaLabel: settings.mollyCtaLabel,
          ctaUrl: settings.mollyCtaUrl,
          showMobile: settings.mollyShowMobile,
          showDesktop: settings.mollyShowDesktop,
        }}
      />
      <PopupManager popups={popupData} />
      {/* Skip link accesible */}
      <Link
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-palm-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </Link>
    </div>
  );
}
