import type { Page, PageBlock } from "@prisma/client";

// Datos editables de los bloques de página (admin → Páginas).
// Las páginas de sistema leen su bloque HERO para título/subtítulo/imagen
// de cabecera, con fallback al texto hardcodeado si el bloque no existe.

export type HeroData = {
  heading?: string;
  subheading?: string;
  imageUrl?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
};

export type RichTextData = {
  key?: string;
  heading?: string;
  body?: string;
};

type PageWithBlocks = (Page & { blocks: PageBlock[] }) | null | undefined;

/** Datos del bloque HERO de una página ({} si no existe). */
export function heroData(page: PageWithBlocks): HeroData {
  const block = page?.blocks.find((b) => b.type === "HERO");
  return (block?.data ?? {}) as HeroData;
}

/** Datos del primer bloque RICH_TEXT de una página ({} si no existe). */
export function richTextData(page: PageWithBlocks): RichTextData {
  const block = page?.blocks.find((b) => b.type === "RICH_TEXT");
  return (block?.data ?? {}) as RichTextData;
}
