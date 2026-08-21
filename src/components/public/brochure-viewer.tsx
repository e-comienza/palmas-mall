"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowsOut,
  CaretLeft,
  CaretRight,
  DownloadSimple,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type BrochurePage = { src: string; thumb: string; label: string };

/**
 * Visor del brochure de sponsors: las hojas del PDF (rasterizadas por
 * Cloudinary con `pg_N`) se pasan una por una sobre un fondo oscuro, con tira
 * de miniaturas, teclado, swipe y pantalla completa. `pdfUrl` abre el
 * documento completo: esto es la vitrina, no el reemplazo.
 */
export function BrochureViewer({
  pages,
  pdfUrl,
  className,
}: {
  pages: BrochurePage[];
  pdfUrl: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; t: number } | null>(null);
  const total = pages.length;

  const step = useCallback(
    (dir: -1 | 1) => setIndex((prev) => (prev + dir + total) % total),
    [total],
  );

  // La miniatura activa siempre a la vista.
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !active) return;
    const left = active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  // En pantalla completa el teclado es global; fuera de ella solo responde
  // cuando el visor tiene el foco, para no robarle las flechas al scroll.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Escape") setFull(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, full]);

  const onStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  useEffect(() => {
    if (!full) return;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [full]);

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const velocity = Math.abs(dx) / Math.max(1, Date.now() - start.t);
    if (Math.abs(dx) > 60 || velocity > 0.4) step(dx > 0 ? -1 : 1);
  };

  if (!total) return null;
  const page = pages[index];

  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      onClick={() => step(dir)}
      aria-label={dir === -1 ? "Hoja anterior" : "Hoja siguiente"}
      className={cn(
        "pressable absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20",
        dir === -1 ? "left-2 sm:left-4" : "right-2 sm:right-4",
      )}
    >
      {dir === -1 ? <CaretLeft size={20} weight="bold" /> : <CaretRight size={20} weight="bold" />}
    </button>
  );

  const counter = (
    <p className="flex items-baseline gap-1.5 text-white/70">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Hoja</span>
      <span className="text-sm font-bold tabular-nums text-white">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-sm tabular-nums">/ {String(total).padStart(2, "0")}</span>
    </p>
  );

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl bg-palm-950 shadow-card">
        {/* Escenario: la hoja se lee como papel impreso sobre fondo oscuro */}
        <div
          role="group"
          tabIndex={0}
          aria-label={`Brochure de sponsors, ${page.label} de ${total}. Usa las flechas para pasar las hojas.`}
          className="relative aspect-[16/9] select-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-leaf-500"
          onKeyDown={onStageKeyDown}
          onTouchStart={(e) => {
            touchStart.current = { x: e.touches[0].clientX, t: Date.now() };
          }}
          onTouchEnd={onTouchEnd}
        >
          <Image
            key={page.src}
            src={page.src}
            alt={page.label}
            fill
            unoptimized
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 900px"
            className="animate-fade-in object-contain"
          />
          {total > 1 ? (
            <>
              {arrow(-1)}
              {arrow(1)}
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {counter}
          <button
            type="button"
            onClick={() => setFull(true)}
            className="pressable inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ArrowsOut size={16} weight="bold" /> Ver en grande
          </button>
        </div>

        {/* Tira de hojas: el brochure completo de un vistazo */}
        {total > 1 ? (
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {pages.map((p, i) => (
              <button
                key={p.thumb}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir a la ${p.label.toLowerCase()}`}
                aria-current={i === index}
                className={cn(
                  "relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-lg bg-palm-900 transition-all duration-300 ease-out-quart sm:w-28",
                  i === index
                    ? "-translate-y-0.5 ring-2 ring-leaf-500"
                    : "opacity-55 hover:opacity-100",
                )}
              >
                <Image
                  src={p.thumb}
                  alt=""
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="112px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-palm-700 px-7 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
        >
          <DownloadSimple size={19} weight="bold" /> Abrir el PDF completo
        </a>
        <p className="text-[13px] text-mist-500">
          {total} hojas · deslízalas o usa las flechas del teclado
        </p>
      </div>

      {/* Pantalla completa */}
      {full ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={page.label}
          className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-palm-950/97 backdrop-blur-sm"
          onTouchStart={(e) => {
            touchStart.current = { x: e.touches[0].clientX, t: Date.now() };
          }}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between p-4">
            {counter}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setFull(false)}
              aria-label="Cerrar el brochure"
              className="pressable flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={22} weight="bold" />
            </button>
          </div>
          <div className="relative flex-1 px-3 pb-5 sm:px-16">
            <Image
              key={`full-${page.src}`}
              src={page.src}
              alt={page.label}
              fill
              unoptimized
              sizes="100vw"
              className="animate-fade-in object-contain"
            />
            {total > 1 ? (
              <>
                {arrow(-1)}
                {arrow(1)}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
