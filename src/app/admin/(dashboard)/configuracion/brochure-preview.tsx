"use client";

import Image from "next/image";
import { ArrowSquareOut, Warning } from "@phosphor-icons/react";
import { isPdfUrl, pdfPageSrc } from "@/lib/media";

/**
 * Todas las hojas del brochure tal como se verán en Be Our Sponsors. Sirve para
 * confirmar que subió el PDF completo y no una sola página.
 */
export function BrochurePreview({ url, pages }: { url: string; pages: number }) {
  if (!url) return null;

  if (!isPdfUrl(url)) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
        <Warning size={16} weight="bold" className="mt-0.5 shrink-0" />
        Este archivo no es un PDF, así que solo se podrá descargar: la página no lo mostrará hoja
        por hoja. Vuelve a subir el brochure en PDF.
      </p>
    );
  }

  const sheets = Array.from({ length: Math.max(0, pages) }, (_, i) => {
    const thumb = pdfPageSrc(url, i + 1, 320);
    const full = pdfPageSrc(url, i + 1, 1600);
    return thumb && full ? { n: i + 1, thumb, full } : null;
  }).filter((s): s is { n: number; thumb: string; full: string } => s !== null);

  if (!sheets.length) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
        <Warning size={16} weight="bold" className="mt-0.5 shrink-0" />
        El PDF no está subido aquí (es un enlace externo), así que solo se podrá descargar. Súbelo
        con el botón de arriba para que se vea hoja por hoja.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-mist-800">
          Hojas que verán los visitantes{" "}
          <span className="font-normal text-mist-500">({sheets.length})</span>
        </p>
        <a
          href="/api/brochure"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-palm-700 hover:text-palm-800"
        >
          <ArrowSquareOut size={15} weight="bold" /> Abrir el PDF completo
        </a>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {sheets.map((sheet) => (
          <a
            key={sheet.n}
            href={sheet.full}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver la hoja ${sheet.n} en grande`}
            className="pressable relative aspect-[16/9] overflow-hidden rounded-lg border border-mist-200 bg-mist-100 transition-colors hover:border-palm-500"
          >
            <Image src={sheet.thumb} alt="" fill unoptimized loading="lazy" sizes="160px" className="object-contain" />
            <span className="absolute bottom-1 right-1 rounded bg-palm-950/70 px-1.5 text-[10px] font-bold tabular-nums text-white">
              {sheet.n}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
