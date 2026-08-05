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

export type QueHacerCard = {
  title?: string;
  text?: string;
  href?: string;
  img?: string;
  alt?: string;
  big?: boolean;
  /** Icono para cards sin foto (ver BLOCK_ICONS). */
  icon?: string;
};

export type MediaTextButton = {
  label?: string;
  url?: string;
  variant?: "primary" | "secondary";
};

export type MediaTextData = {
  heading?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  buttons?: MediaTextButton[];
};

export type QueHacerData = {
  heading?: string;
  intro?: string;
  items?: QueHacerCard[];
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

/** Datos del bloque SERVICE_CARDS (sección "¿Qué hacer?") de una página ({} si no existe). */
export function queHacerData(page: PageWithBlocks): QueHacerData {
  const block = page?.blocks.find((b) => b.type === "SERVICE_CARDS");
  return (block?.data ?? {}) as QueHacerData;
}

/** Datos del primer bloque MEDIA_TEXT (imagen + texto + botones) de una página. */
export function mediaTextData(page: PageWithBlocks): MediaTextData {
  const block = page?.blocks.find((b) => b.type === "MEDIA_TEXT");
  return (block?.data ?? {}) as MediaTextData;
}
