"use client";

import { WhatsappLogo } from "@phosphor-icons/react";

/** CTA flotante de WhatsApp, siempre visible en móvil y desktop. */
export function WhatsappFloat({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="pressable fixed bottom-5 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-palm-700 text-white shadow-[0_6px_20px_rgb(6_105_57/0.4)] transition-transform duration-200 hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <WhatsappLogo size={28} weight="fill" />
    </a>
  );
}
