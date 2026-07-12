"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { List, X, MapPin, WhatsappLogo, InstagramLogo, TiktokLogo, FacebookLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; url: string };

/**
 * Navbar blanco sólido y sticky: nunca se superpone al hero.
 * El menú móvil es un overlay a pantalla completa bajo el header,
 * con scroll bloqueado, cierre con Escape y foco devuelto al botón.
 */
export function Header({
  navItems,
  logoUrl,
  mallName,
  whatsapp,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: {
  navItems: NavItem[];
  logoUrl: string;
  mallName: string;
  whatsapp: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Sombra sutil solo al hacer scroll
  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "8px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Menú abierto: bloquear scroll de fondo y cerrar con Escape
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-px w-full" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white transition-shadow duration-300",
          scrolled
            ? "border-transparent shadow-[0_1px_2px_rgb(6_33_18/0.05),0_4px_16px_rgb(6_33_18/0.06)]"
            : "border-mist-200",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[76px] lg:px-8">
          <Link
            href="/"
            aria-label={`${mallName}, ir al inicio`}
            className="pressable shrink-0"
            onClick={close}
          >
            <Image
              src={logoUrl}
              alt={mallName}
              width={128}
              height={80}
              priority
              className="h-11 w-auto md:h-[52px]"
            />
          </Link>

          {/* Nav desktop */}
          <nav aria-label="Navegación principal" className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200",
                  pathname === item.url
                    ? "bg-palm-50 text-palm-800"
                    : "text-mist-700 hover:bg-mist-100 hover:text-palm-900",
                )}
              >
                {item.label}
                {pathname === item.url ? (
                  <span aria-hidden className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-palm-600" />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable hidden h-10 items-center gap-2 rounded-full bg-palm-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-palm-800 sm:inline-flex"
            >
              <WhatsappLogo size={17} weight="fill" /> WhatsApp
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="pressable flex size-11 items-center justify-center rounded-full text-palm-950 transition-colors hover:bg-mist-100 lg:hidden"
            >
              {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa (fuera del header: sin problemas de stacking) */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-white px-6 pb-10 pt-3 lg:hidden"
          >
            <nav aria-label="Navegación móvil" className="flex flex-col">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.url}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    href={item.url}
                    onClick={close}
                    className={cn(
                      "group flex items-center justify-between border-b border-mist-100 py-4 font-display text-[26px] font-bold tracking-[-0.01em] transition-colors",
                      pathname === item.url ? "text-palm-700" : "text-palm-950 hover:text-palm-700",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="translate-x-0 text-palm-300 transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + navItems.length * 0.05, duration: 0.3 }}
              className="mt-8 flex flex-col gap-3"
            >
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable flex h-12 items-center justify-center gap-2 rounded-full bg-palm-700 text-base font-semibold text-white transition-colors hover:bg-palm-800"
              >
                <WhatsappLogo size={20} weight="fill" /> Escríbenos por WhatsApp
              </a>
              <Link
                href="/como-llegar"
                onClick={close}
                className="pressable flex h-12 items-center justify-center gap-2 rounded-full border border-palm-700/25 bg-white text-base font-semibold text-palm-800 transition-colors hover:bg-palm-50"
              >
                <MapPin size={20} /> Cómo llegar
              </Link>
            </motion.div>

            <div className="mt-auto flex items-center gap-3 pt-10">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="pressable flex size-11 items-center justify-center rounded-full bg-mist-100 text-palm-800 transition-colors hover:bg-palm-100">
                  <InstagramLogo size={22} />
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="pressable flex size-11 items-center justify-center rounded-full bg-mist-100 text-palm-800 transition-colors hover:bg-palm-100">
                  <TiktokLogo size={22} />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="pressable flex size-11 items-center justify-center rounded-full bg-mist-100 text-palm-800 transition-colors hover:bg-palm-100">
                  <FacebookLogo size={22} />
                </a>
              )}
              <p className="ml-auto text-[13px] font-medium text-mist-500">Tus mejores momentos®</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
