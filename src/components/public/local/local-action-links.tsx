import Link from "next/link";
import type { Local } from "@prisma/client";
import {
  Phone,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
  MapPin,
  Globe,
  ForkKnife,
  EnvelopeSimple,
  CalendarCheck,
  Moped,
} from "@phosphor-icons/react/dist/ssr";

type Action = {
  key: string;
  label: string;
  href: string;
  external: boolean;
  Icon: React.ElementType;
};

/**
 * CTAs del local con jerarquía clara:
 * - Restaurantes: Ver menú y WhatsApp como acciones principales.
 * - Tiendas/servicios: Contactar (WhatsApp) y Sitio web como principales.
 * Solo se muestran los links que existen; nunca botones vacíos.
 */
export function localActions(local: Local): { primary: Action[]; secondary: Action[] } {
  const all: Record<string, Action | null> = {
    menu: local.menuUrl
      ? { key: "menu", label: "Ver menú", href: local.menuUrl, external: true, Icon: ForkKnife }
      : null,
    whatsapp: local.whatsapp
      ? { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${local.whatsapp}`, external: true, Icon: WhatsappLogo }
      : null,
    reservation: local.reservationUrl
      ? { key: "reservation", label: "Reservar", href: local.reservationUrl, external: true, Icon: CalendarCheck }
      : null,
    delivery: local.deliveryUrl
      ? { key: "delivery", label: "Pedir a domicilio", href: local.deliveryUrl, external: true, Icon: Moped }
      : null,
    website: local.websiteUrl
      ? { key: "website", label: "Sitio web", href: local.websiteUrl, external: true, Icon: Globe }
      : null,
    instagram: local.instagramUrl
      ? { key: "instagram", label: "Instagram", href: local.instagramUrl, external: true, Icon: InstagramLogo }
      : null,
    facebook: local.facebookUrl
      ? { key: "facebook", label: "Facebook", href: local.facebookUrl, external: true, Icon: FacebookLogo }
      : null,
    tiktok: local.tiktokUrl
      ? { key: "tiktok", label: "TikTok", href: local.tiktokUrl, external: true, Icon: TiktokLogo }
      : null,
    phone: local.phone
      ? { key: "phone", label: "Llamar", href: `tel:${local.phone.replace(/\s/g, "")}`, external: false, Icon: Phone }
      : null,
    email: local.email
      ? { key: "email", label: "Escribir", href: `mailto:${local.email}`, external: false, Icon: EnvelopeSimple }
      : null,
    directions: { key: "directions", label: "Cómo llegar", href: "/como-llegar", external: false, Icon: MapPin },
  };

  const order = local.isRestaurant
    ? ["menu", "whatsapp", "reservation", "delivery", "instagram", "phone", "website", "facebook", "tiktok", "email", "directions"]
    : ["whatsapp", "website", "instagram", "reservation", "delivery", "phone", "facebook", "tiktok", "email", "directions"];

  const actions = order.map((k) => all[k]).filter((a): a is Action => Boolean(a));
  return { primary: actions.slice(0, 2), secondary: actions.slice(2) };
}

export function LocalActionButtons({ local }: { local: Local }) {
  const { primary, secondary } = localActions(local);

  const renderAction = (action: Action, variant: "primary" | "secondary") => {
    const cls =
      variant === "primary"
        ? "pressable inline-flex h-12 items-center justify-center gap-2 rounded-full bg-palm-700 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-palm-800"
        : "pressable inline-flex h-11 items-center gap-2 rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-palm-800 transition-colors hover:border-palm-400 hover:bg-palm-50";
    const icon = <action.Icon size={variant === "primary" ? 19 : 17} weight={action.key === "whatsapp" ? "fill" : "regular"} />;
    if (action.external) {
      return (
        <a key={action.key} href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {icon} {action.label}
        </a>
      );
    }
    return (
      <Link key={action.key} href={action.href} className={cls}>
        {icon} {action.label}
      </Link>
    );
  };

  return (
    <div className="space-y-3">
      {primary.length ? (
        <div className="flex flex-wrap gap-3">
          {primary.map((a) => renderAction(a, "primary"))}
        </div>
      ) : null}
      {secondary.length ? (
        <div className="flex flex-wrap gap-2.5">
          {secondary.map((a) => renderAction(a, "secondary"))}
        </div>
      ) : null}
    </div>
  );
}
