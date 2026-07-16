"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";

export type PopupEventSlide = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  dateLabel: string;
};

export type PopupData = {
  id: string;
  mode: "SIMPLE" | "EVENT_CAROUSEL";
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  placement: "ALL" | "HOME" | "LOCALES" | "EVENTOS" | "BLOG" | "CUSTOM";
  customPath: string;
  frequency: "ONCE_PER_SESSION" | "ONCE_PER_DAYS" | "ALWAYS";
  frequencyDays: number;
  delaySeconds: number;
  exitIntent: boolean;
  audience: "ALL" | "DESKTOP" | "MOBILE";
  events: PopupEventSlide[];
};

function matchesPath(popup: PopupData, path: string): boolean {
  switch (popup.placement) {
    case "ALL":
      return true;
    case "HOME":
      return path === "/";
    case "LOCALES":
      return path.startsWith("/directorio");
    case "EVENTOS":
      return path.startsWith("/eventos");
    case "BLOG":
      return path.startsWith("/blog");
    case "CUSTOM":
      return popup.customPath ? path.startsWith(popup.customPath) : false;
  }
}

function alreadySeen(popup: PopupData): boolean {
  const key = `pm-popup-${popup.id}`;
  if (popup.frequency === "ALWAYS") return false;
  if (popup.frequency === "ONCE_PER_SESSION") {
    return sessionStorage.getItem(key) === "1";
  }
  const last = localStorage.getItem(key);
  if (!last) return false;
  const elapsed = Date.now() - Number(last);
  return elapsed < popup.frequencyDays * 24 * 60 * 60 * 1000;
}

function markSeen(popup: PopupData) {
  const key = `pm-popup-${popup.id}`;
  if (popup.frequency === "ONCE_PER_SESSION") {
    sessionStorage.setItem(key, "1");
  } else if (popup.frequency === "ONCE_PER_DAYS") {
    localStorage.setItem(key, String(Date.now()));
  }
}

export function PopupManager({ popups }: { popups: PopupData[] }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState<PopupData | null>(null);
  const reduce = useReducedMotion();

  const candidate = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return popups.find((p) => {
      if (!matchesPath(p, pathname)) return false;
      if (p.audience === "DESKTOP" && isMobile) return false;
      if (p.audience === "MOBILE" && !isMobile) return false;
      // Carrusel sin eventos válidos: no mostrar
      if (p.mode === "EVENT_CAROUSEL" && !p.events.length) return false;
      return true;
    });
  }, [popups, pathname]);

  useEffect(() => {
    if (!candidate) return;
    if (alreadySeen(candidate)) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setVisible(candidate);
      markSeen(candidate);
    };

    const timer = setTimeout(show, Math.max(1, candidate.delaySeconds) * 1000);

    let exitHandler: ((e: MouseEvent) => void) | null = null;
    if (candidate.exitIntent) {
      exitHandler = (e: MouseEvent) => {
        if (e.clientY <= 0) show();
      };
      document.addEventListener("mouseleave", exitHandler);
    }

    return () => {
      clearTimeout(timer);
      if (exitHandler) document.removeEventListener("mouseleave", exitHandler);
    };
  }, [candidate]);

  const close = () => setVisible(null);
  // Al navegar, el popup solo sigue visible si aplica a la nueva ruta
  const active = visible && matchesPath(visible, pathname) ? visible : null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label={active.title}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          data-pm-popup
          className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgb(2_33_18/0.25)] sm:inset-x-auto sm:right-6 sm:bottom-24"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar aviso"
            className="pressable absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-mist-700 shadow-card transition-colors hover:text-palm-950"
          >
            <X size={18} weight="bold" />
          </button>
          {active.mode === "EVENT_CAROUSEL" ? (
            <div className="p-5">
              <p className="font-display text-lg font-bold leading-snug text-palm-950">
                {active.title || "Próximos eventos"}
              </p>
              {active.body ? (
                <p className="mt-1 text-sm leading-relaxed text-mist-600">{active.body}</p>
              ) : null}
              <div className="scrollbar-none -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
                {active.events.map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/eventos/${ev.slug}`}
                    onClick={close}
                    className="group w-[80%] shrink-0 snap-center overflow-hidden rounded-xl bg-mist-50 ring-1 ring-mist-200 transition-shadow hover:shadow-card"
                  >
                    <div className="relative aspect-[16/10] w-full bg-mist-100">
                      {ev.coverUrl ? (
                        <Image src={ev.coverUrl} alt={ev.title} fill sizes="320px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] font-semibold text-palm-700">{ev.dateLabel}</p>
                      <p className="mt-0.5 line-clamp-2 font-display text-[15px] font-bold leading-snug text-palm-950">
                        {ev.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/eventos"
                onClick={close}
                className="pressable mt-4 inline-flex h-10 items-center justify-center rounded-full bg-palm-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
              >
                Ver todos los eventos
              </Link>
            </div>
          ) : (
            <>
              {active.imageUrl ? (
                <div className="relative h-36 w-full">
                  <Image src={active.imageUrl} alt="" fill sizes="384px" className="object-cover" />
                </div>
              ) : null}
              <div className="p-5">
                <p className="font-display text-lg font-bold leading-snug text-palm-950">
                  {active.title}
                </p>
                {active.body ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{active.body}</p>
                ) : null}
                {active.ctaLabel && active.ctaUrl ? (
                  <Link
                    href={active.ctaUrl}
                    onClick={close}
                    className="pressable mt-4 inline-flex h-10 items-center justify-center rounded-full bg-palm-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
                  >
                    {active.ctaLabel}
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
