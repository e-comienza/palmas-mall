"use client";

import { useState } from "react";
import { CaretUp, CaretDown, Plus, Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload, GalleryUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";

export type EditableBlock = {
  type: string;
  data: Record<string, unknown>;
  visible: boolean;
};

const BLOCK_TYPES: { value: string; label: string }[] = [
  { value: "HERO", label: "Hero (imagen + título)" },
  { value: "RICH_TEXT", label: "Texto enriquecido" },
  { value: "IMAGE", label: "Imagen" },
  { value: "GALLERY", label: "Galería" },
  { value: "CTA", label: "Llamado a la acción" },
  { value: "FAQ", label: "Preguntas frecuentes" },
  { value: "FEATURED_LOCALES", label: "Locales destacados" },
  { value: "FEATURED_EVENTS", label: "Eventos próximos" },
  { value: "FEATURED_POSTS", label: "Posts recientes" },
  { value: "MAP", label: "Mapa / cómo llegar" },
  { value: "FORM", label: "Formulario de contacto" },
  { value: "AWARDS", label: "Galardones" },
  { value: "VIDEO", label: "Video" },
];

const str = (b: EditableBlock, k: string) => (typeof b.data[k] === "string" ? (b.data[k] as string) : "");

/**
 * Editor de bloques de página: agregar, ordenar, editar y eliminar bloques.
 * Serializa a JSON en un input hidden que procesa upsertPage.
 */
export function BlockEditor({
  name,
  defaultBlocks,
}: {
  name: string;
  defaultBlocks: EditableBlock[];
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(defaultBlocks);

  const setData = (i: number, key: string, value: unknown) => {
    setBlocks((prev) =>
      prev.map((b, j) => (j === i ? { ...b, data: { ...b.data, [key]: value } } : b)),
    );
  };

  const move = (i: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
      {blocks.map((block, i) => (
        <div key={i} className="rounded-2xl border border-mist-200 bg-mist-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-palm-950">
              {BLOCK_TYPES.find((t) => t.value === block.type)?.label ?? block.type}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir bloque" className="pressable flex size-8 items-center justify-center rounded-full text-mist-500 hover:bg-white disabled:opacity-30">
                <CaretUp size={15} weight="bold" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Bajar bloque" className="pressable flex size-8 items-center justify-center rounded-full text-mist-500 hover:bg-white disabled:opacity-30">
                <CaretDown size={15} weight="bold" />
              </button>
              <button type="button" onClick={() => setBlocks((prev) => prev.filter((_, j) => j !== i))} aria-label="Eliminar bloque" className="pressable flex size-8 items-center justify-center rounded-full text-mist-500 hover:bg-red-50 hover:text-red-700">
                <Trash size={15} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {["HERO", "RICH_TEXT", "CTA", "GALLERY", "FAQ", "FEATURED_LOCALES", "FEATURED_EVENTS", "FEATURED_POSTS", "MAP", "FORM", "VIDEO"].includes(block.type) ? (
              <Input
                value={str(block, "heading")}
                onChange={(e) => setData(i, "heading", e.target.value)}
                placeholder="Título del bloque"
                aria-label="Título del bloque"
              />
            ) : null}

            {block.type === "HERO" ? (
              <>
                <Input value={str(block, "subheading")} onChange={(e) => setData(i, "subheading", e.target.value)} placeholder="Subtítulo" aria-label="Subtítulo" />
                <ImageUpload name={`__block-${i}-img`} defaultValue={str(block, "imageUrl")} folder="paginas" onChange={(v) => setData(i, "imageUrl", v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={str(block, "ctaPrimaryLabel")} onChange={(e) => setData(i, "ctaPrimaryLabel", e.target.value)} placeholder="Texto del botón" aria-label="Texto del botón" />
                  <Input value={str(block, "ctaPrimaryUrl")} onChange={(e) => setData(i, "ctaPrimaryUrl", e.target.value)} placeholder="/directorio" aria-label="URL del botón" />
                </div>
              </>
            ) : null}

            {block.type === "RICH_TEXT" ? (
              <RichTextEditor
                name={`__block-${i}-body-ignored`}
                defaultValue={str(block, "body")}
                onChange={(v) => setData(i, "body", v)}
              />
            ) : null}

            {block.type === "IMAGE" ? (
              <>
                <ImageUpload name={`__block-${i}-img`} defaultValue={str(block, "url")} folder="paginas" onChange={(v) => setData(i, "url", v)} />
                <Input value={str(block, "alt")} onChange={(e) => setData(i, "alt", e.target.value)} placeholder="Texto alternativo (accesibilidad)" aria-label="Alt text" />
                <Input value={str(block, "caption")} onChange={(e) => setData(i, "caption", e.target.value)} placeholder="Pie de foto (opcional)" aria-label="Pie de foto" />
              </>
            ) : null}

            {block.type === "GALLERY" ? (
              <>
                <GalleryUpload name={`__block-${i}-gal`} defaultValue={Array.isArray(block.data.urls) ? (block.data.urls as string[]) : []} folder="paginas" onChange={(urls) => setData(i, "urls", urls)} />
              </>
            ) : null}

            {block.type === "CTA" ? (
              <>
                <Textarea value={str(block, "body")} onChange={(e) => setData(i, "body", e.target.value)} placeholder="Texto de apoyo" aria-label="Texto de apoyo" className="min-h-[60px]" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={str(block, "ctaLabel")} onChange={(e) => setData(i, "ctaLabel", e.target.value)} placeholder="Texto del botón" aria-label="Texto del botón" />
                  <Input value={str(block, "ctaUrl")} onChange={(e) => setData(i, "ctaUrl", e.target.value)} placeholder="/contacto" aria-label="URL del botón" />
                </div>
              </>
            ) : null}

            {block.type === "VIDEO" ? (
              <Input value={str(block, "url")} onChange={(e) => setData(i, "url", e.target.value)} placeholder="https://www.youtube.com/embed/… o URL de video" aria-label="URL del video" />
            ) : null}
          </div>
        </div>
      ))}

      <AddBlock onAdd={(type) => setBlocks((prev) => [...prev, { type, data: {}, visible: true }])} />
    </div>
  );
}

function AddBlock({ onAdd }: { onAdd: (type: string) => void }) {
  const [type, setType] = useState("RICH_TEXT");
  return (
    <div className="flex items-center gap-3">
      <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de bloque" className="max-w-xs">
        {BLOCK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>
      <button
        type="button"
        onClick={() => onAdd(type)}
        className="pressable inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-palm-700/30 bg-white px-4 text-sm font-semibold text-palm-800 hover:bg-palm-50"
      >
        <Plus size={15} weight="bold" /> Agregar bloque
      </button>
    </div>
  );
}
