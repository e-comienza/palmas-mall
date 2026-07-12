"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { normalizeMollyUrl, isAnimatedImage } from "@/lib/molly-image";

export type MollyConfig = {
  enabled: boolean;
  imageUrl: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  showMobile: boolean;
  showDesktop: boolean;
};

const STORAGE_KEY = "pm-molly-dismissed";

/**
 * Molly, la palmera amigable de Palmas Mall: aparece en la esquina inferior
 * izquierda con un speech bubble. La imagen puede ser estática o un GIF/Giphy
 * (en ese caso el saludo lo trae el propio GIF y no se agrega motion extra).
 * Se cierra con un tap y recuerda el cierre durante la sesión.
 */
export function Molly({ config }: { config: MollyConfig }) {
  const [visible, setVisible] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const reduce = useReducedMotion();

  const imageUrl = normalizeMollyUrl(config.imageUrl);
  const animated = isAnimatedImage(imageUrl);

  useEffect(() => {
    if (!config.enabled) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const isMobile = window.innerWidth < 768;
    if (isMobile && !config.showMobile) return;
    if (!isMobile && !config.showDesktop) return;

    const showTimer = setTimeout(() => setVisible(true), 2500);
    const bubbleTimer = setTimeout(() => {
      // El bubble solo se abre solo en desktop y si no hay un popup activo;
      // en móvil queda disponible al tocar a Molly (no tapa CTAs ni contenido)
      const stillMobile = window.innerWidth < 768;
      if (!stillMobile && !document.querySelector("[data-pm-popup]")) setBubbleOpen(true);
    }, 3800);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(bubbleTimer);
    };
  }, [config]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (!config.enabled || !imageUrl) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.25 }}
          className="fixed bottom-5 left-4 z-30 flex items-end gap-2 sm:bottom-6 sm:left-6"
        >
          {/* Molly */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBubbleOpen((v) => !v)}
              aria-label={bubbleOpen ? "Ocultar mensaje de Molly" : "Ver mensaje de Molly"}
              aria-expanded={bubbleOpen}
              className="pressable relative flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-leaf-500/50 bg-white shadow-[0_6px_20px_rgb(6_33_18/0.18)] transition-transform duration-200 hover:scale-105 sm:size-[72px]"
            >
              {animated ? (
                // GIF: ya trae su propia animación de saludo
                <Image
                  src={imageUrl}
                  alt="Molly, la palmera amigable de Palmas Mall, saludando"
                  width={72}
                  height={67}
                  unoptimized
                  className="size-full object-contain p-1"
                />
              ) : (
                <motion.div
                  animate={reduce ? undefined : { rotate: [0, -8, 8, -6, 6, 0] }}
                  transition={
                    reduce
                      ? undefined
                      : { duration: 1.6, delay: 1.2, repeat: Infinity, repeatDelay: 7, ease: "easeInOut" }
                  }
                  className="origin-bottom"
                >
                  <Image
                    src={imageUrl}
                    alt="Molly, la palmera amigable de Palmas Mall"
                    width={44}
                    height={36}
                    className="h-9 w-auto"
                  />
                </motion.div>
              )}
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar a Molly"
              className="pressable absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-mist-800 text-white shadow-sm transition-colors hover:bg-palm-950"
            >
              <X size={10} weight="bold" />
            </button>
          </div>

          {/* Speech bubble */}
          <AnimatePresence>
            {bubbleOpen && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="relative mb-1 max-w-[min(240px,calc(100vw-8.5rem))] origin-bottom-left rounded-2xl rounded-bl-md bg-white p-4 shadow-[0_8px_28px_rgb(6_33_18/0.16)] sm:max-w-[280px]"
              >
                <p className="text-[13px] font-bold text-palm-800">Molly</p>
                <p className="mt-1 text-sm leading-relaxed text-mist-700">{config.message}</p>
                {config.ctaLabel && config.ctaUrl ? (
                  <Link
                    href={config.ctaUrl}
                    onClick={dismiss}
                    className="pressable mt-3 inline-flex h-9 items-center rounded-full bg-palm-700 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-800"
                  >
                    {config.ctaLabel}
                  </Link>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
