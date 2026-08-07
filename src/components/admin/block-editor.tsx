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
  { value: "FEATURED_LOCALES", label: "Locales nuevos" },
  { value: "FEATURED_EVENTS", label: "Eventos próximos" },
  { value: "FEATURED_POSTS", label: "Posts recientes" },
  { value: "MAP", label: "Mapa / cómo llegar" },
  { value: "FORM", label: "Formulario de contacto" },
  { value: "AWARDS", label: "Galardones" },
  { value: "SERVICE_CARDS", label: "Cards de secciones (foto o icono + título + subtítulo)" },
  { value: "MEDIA_TEXT", label: "Imagen + texto + botones" },
  { value: "VIDEO", label: "Video" },
];

// Debe coincidir con BLOCK_ICONS en components/public/block-icons.tsx.
const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Sin icono" },
  { value: "car", label: "Carro" },
  { value: "taxi", label: "Taxi" },
  { value: "bus", label: "Bus" },
  { value: "pet", label: "Mascota" },
  { value: "clock", label: "Reloj" },
  { value: "pin", label: "Ubicación" },
  { value: "food", label: "Comida" },
  { value: "shopping", label: "Compras" },
  { value: "ticket", label: "Entradas" },
  { value: "star", label: "Estrella" },
  { value: "users", label: "Personas" },
  { value: "kids", label: "Niños" },
];

type CardItem = {
  title?: string;
  text?: string;
  href?: string;
  img?: string;
  alt?: string;
  big?: boolean;
  icon?: string;
};

type MediaTextButton = { label?: string; url?: string; variant?: "primary" | "secondary" | "link" };

// Defaults de "¿Qué hacer en Palmas Mall?" para prellenar el bloque al agregarlo.
const QUE_HACER_DEFAULTS: Record<string, unknown> = {
  heading: "¿Qué hacer en Palmas Mall?",
  intro: "Seis maneras de vivir el mall: elige tu plan de hoy.",
  items: [
    { title: "Comer", text: "El mejor Food Hall de Cali, a la mesa", href: "/food-drinks", img: "/images/galeria/20241229_020127780_ios-scaled.webp", alt: "Food Hall de Palmas Mall iluminado en la noche", big: true },
    { title: "Comprar", text: "Boutiques y marcas exclusivas", href: "/shop-more", img: "/images/galeria/dsc1837-scaled.webp", alt: "Desfile de moda en Palmas Mall" },
    { title: "Vivir eventos", text: "Ferias, música y planes cada semana", href: "/eventos", img: "/images/galeria/dsc2143-scaled.webp", alt: "Evento con público en Palmas Mall" },
    { title: "Venir con tu mascota", text: "Espacios abiertos y petfriendly", href: "/conoce-palmas-mall", img: "/images/galeria/dsc2168-scaled.webp", alt: "Terrazas al aire libre de Palmas Mall" },
    { title: "Trabajar o reunirte", text: "Coworking rodeado de vegetación", href: "/conoce-palmas-mall", img: "/images/galeria/shopping-cali2.webp", alt: "Arquitectura a cielo abierto de Palmas Mall" },
    { title: "Disfrutar en familia", text: "PlayZone y actividades para niños", href: "/play-zone", img: "/images/galeria/dsc1699-1-scaled.webp", alt: "Familias disfrutando en Palmas Mall", big: true },
  ] satisfies CardItem[],
};

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
                <Input
                  value={str(block, "intro")}
                  onChange={(e) => setData(i, "intro", e.target.value)}
                  placeholder="Texto introductorio (opcional)"
                  aria-label="Texto introductorio"
                />
                <GalleryUpload name={`__block-${i}-gal`} defaultValue={Array.isArray(block.data.urls) ? (block.data.urls as string[]) : []} folder="paginas" onChange={(urls) => setData(i, "urls", urls)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={str(block, "ctaLabel")}
                    onChange={(e) => setData(i, "ctaLabel", e.target.value)}
                    placeholder="Texto del enlace (opcional)"
                    aria-label="Texto del enlace"
                  />
                  <Input
                    value={str(block, "ctaUrl")}
                    onChange={(e) => setData(i, "ctaUrl", e.target.value)}
                    placeholder="/momentos-palmas-mall"
                    aria-label="URL del enlace"
                  />
                </div>
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

            {block.type === "MEDIA_TEXT" ? (
              <>
                <Input
                  value={str(block, "heading")}
                  onChange={(e) => setData(i, "heading", e.target.value)}
                  placeholder="Título de la sección"
                  aria-label="Título de la sección"
                />
                <ImageUpload
                  name={`__block-${i}-mt-img`}
                  defaultValue={str(block, "imageUrl")}
                  folder="paginas"
                  onChange={(v) => setData(i, "imageUrl", v)}
                />
                <p className="text-[13px] text-mist-500">
                  Segunda imagen (opcional): si la cargas, las dos fotos se muestran en collage.
                </p>
                <ImageUpload
                  name={`__block-${i}-mt-img2`}
                  defaultValue={str(block, "imageUrl2")}
                  folder="paginas"
                  onChange={(v) => setData(i, "imageUrl2", v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={str(block, "imageAlt")}
                    onChange={(e) => setData(i, "imageAlt", e.target.value)}
                    placeholder="Texto alternativo (accesibilidad)"
                    aria-label="Alt text"
                  />
                  <Input
                    value={str(block, "imageAlt2")}
                    onChange={(e) => setData(i, "imageAlt2", e.target.value)}
                    placeholder="Texto alternativo de la 2ª imagen"
                    aria-label="Alt text de la segunda imagen"
                  />
                  <Select
                    value={str(block, "imagePosition") || "left"}
                    onChange={(e) => setData(i, "imagePosition", e.target.value)}
                    aria-label="Posición de la imagen"
                  >
                    <option value="left">Imagen a la izquierda</option>
                    <option value="right">Imagen a la derecha</option>
                  </Select>
                </div>
                <RichTextEditor
                  name={`__block-${i}-mt-body-ignored`}
                  defaultValue={str(block, "body")}
                  onChange={(v) => setData(i, "body", v)}
                />
                <ButtonsEditor
                  buttons={Array.isArray(block.data.buttons) ? (block.data.buttons as MediaTextButton[]) : []}
                  onChange={(buttons) => setData(i, "buttons", buttons)}
                />
              </>
            ) : null}

            {block.type === "SERVICE_CARDS" ? (
              <>
                <Input
                  value={str(block, "heading")}
                  onChange={(e) => setData(i, "heading", e.target.value)}
                  placeholder="Título de la sección"
                  aria-label="Título de la sección"
                />
                <Input
                  value={str(block, "intro")}
                  onChange={(e) => setData(i, "intro", e.target.value)}
                  placeholder="Texto introductorio (opcional)"
                  aria-label="Texto introductorio"
                />
                <CardsEditor
                  blockIndex={i}
                  items={Array.isArray(block.data.items) ? (block.data.items as CardItem[]) : []}
                  onChange={(items) => setData(i, "items", items)}
                />
              </>
            ) : null}
          </div>
        </div>
      ))}

      <AddBlock
        onAdd={(type) =>
          setBlocks((prev) => [
            ...prev,
            { type, data: type === "SERVICE_CARDS" ? QUE_HACER_DEFAULTS : {}, visible: true },
          ])
        }
      />
    </div>
  );
}

/** Editor de botones del bloque MEDIA_TEXT. */
function ButtonsEditor({
  buttons,
  onChange,
}: {
  buttons: MediaTextButton[];
  onChange: (buttons: MediaTextButton[]) => void;
}) {
  const setButton = (i: number, patch: Partial<MediaTextButton>) =>
    onChange(buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-2.5">
      {buttons.map((b, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Input
            value={b.label || ""}
            onChange={(e) => setButton(i, { label: e.target.value })}
            placeholder="Texto del botón"
            aria-label="Texto del botón"
          />
          <Input
            value={b.url || ""}
            onChange={(e) => setButton(i, { url: e.target.value })}
            placeholder="https://… o /contacto"
            aria-label="URL del botón"
          />
          <Select
            value={b.variant || "primary"}
            onChange={(e) => setButton(i, { variant: e.target.value as MediaTextButton["variant"] })}
            aria-label="Estilo del botón"
            className="max-w-36"
          >
            <option value="primary">Principal</option>
            <option value="secondary">Secundario</option>
            <option value="link">Enlace</option>
          </Select>
          <button
            type="button"
            onClick={() => onChange(buttons.filter((_, j) => j !== i))}
            aria-label="Eliminar botón"
            className="pressable flex size-8 shrink-0 items-center justify-center rounded-full text-mist-500 hover:bg-red-50 hover:text-red-700"
          >
            <Trash size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...buttons, { variant: "primary" }])}
        className="pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-palm-700/30 bg-white px-4 text-[13px] font-semibold text-palm-800 hover:bg-palm-50"
      >
        <Plus size={13} weight="bold" /> Agregar botón
      </button>
    </div>
  );
}

/** Editor de cards (foto o icono + título + subtítulo + link) del bloque SERVICE_CARDS. */
function CardsEditor({
  blockIndex,
  items,
  onChange,
}: {
  blockIndex: number;
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
}) {
  const setItem = (i: number, patch: Partial<CardItem>) =>
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-mist-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[13px] font-bold text-palm-950">Card {i + 1}</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir card" className="pressable flex size-7 items-center justify-center rounded-full text-mist-500 hover:bg-mist-100 disabled:opacity-30">
                <CaretUp size={13} weight="bold" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar card" className="pressable flex size-7 items-center justify-center rounded-full text-mist-500 hover:bg-mist-100 disabled:opacity-30">
                <CaretDown size={13} weight="bold" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Eliminar card" className="pressable flex size-7 items-center justify-center rounded-full text-mist-500 hover:bg-red-50 hover:text-red-700">
                <Trash size={13} />
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            <ImageUpload
              key={`${i}-${item.img || ""}`}
              name={`__block-${blockIndex}-card-${i}-img`}
              defaultValue={item.img || ""}
              folder="paginas"
              onChange={(v) => setItem(i, { img: v })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Input value={item.title || ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Título" aria-label="Título de la card" />
              <Input value={item.text || ""} onChange={(e) => setItem(i, { text: e.target.value })} placeholder="Subtítulo" aria-label="Subtítulo de la card" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Input value={item.href || ""} onChange={(e) => setItem(i, { href: e.target.value })} placeholder="/food-drinks" aria-label="URL de destino" />
              <Input value={item.alt || ""} onChange={(e) => setItem(i, { alt: e.target.value })} placeholder="Texto alternativo (accesibilidad)" aria-label="Alt text" />
            </div>
            <Select
              value={item.icon || ""}
              onChange={(e) => setItem(i, { icon: e.target.value })}
              aria-label="Icono de la card"
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label === "Sin icono" ? "Icono: sin icono (solo si no hay foto)" : `Icono: ${o.label}`}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-mist-700">
              <input
                type="checkbox"
                checked={!!item.big}
                onChange={(e) => setItem(i, { big: e.target.checked })}
                className="size-4 accent-palm-700"
              />
              Card grande (ocupa 2 columnas)
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, {}])}
        className="pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-palm-700/30 bg-white px-4 text-[13px] font-semibold text-palm-800 hover:bg-palm-50"
      >
        <Plus size={13} weight="bold" /> Agregar card
      </button>
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
