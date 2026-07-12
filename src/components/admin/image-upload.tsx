"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadSimple, X, Spinner, LinkSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { normalizeMollyUrl } from "@/lib/molly-image";

/**
 * Upload de imagen drag-and-drop. Sube a /api/upload (Cloudinary o local en dev)
 * y guarda la URL resultante en un input hidden con el `name` indicado.
 */
export function ImageUpload({
  name,
  label,
  defaultValue = "",
  folder = "general",
  aspect = "aspect-video",
  onChange,
  allowUrl = false,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  folder?: string;
  aspect?: string;
  onChange?: (url: string) => void;
  /** Permite pegar una URL externa (imagen, GIF o link de Giphy) */
  allowUrl?: boolean;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [url, setUrlState] = useState(defaultValue);
  const setUrl = (u: string) => {
    setUrlState(u);
    onChange?.(u);
  };
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error subiendo la imagen");
      setUrl(data.url);
      toast.success("Imagen subida");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error subiendo la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-semibold text-mist-800">{label}</p> : null}
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className={cn("group relative overflow-hidden rounded-xl border border-mist-200 bg-mist-100", aspect)}>
          <Image
            src={url}
            alt=""
            fill
            sizes="480px"
            className="object-contain"
            unoptimized={url.startsWith("/uploads") || /\.gif(\?|$)/i.test(url) || url.includes("giphy.com")}
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Quitar imagen"
            className="pressable absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/95 text-mist-700 shadow-card transition-colors hover:text-red-700"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm transition-colors",
            aspect,
            dragging
              ? "border-palm-600 bg-palm-50 text-palm-800"
              : "border-mist-300 bg-mist-50 text-mist-500 hover:border-palm-500 hover:text-palm-700",
          )}
        >
          {uploading ? (
            <>
              <Spinner size={24} className="animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              <UploadSimple size={24} />
              <span className="font-medium">Arrastra una imagen o haz clic</span>
              <span className="text-[12px]">JPG, PNG o WebP · máx. 8 MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {allowUrl && !url ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkSimple size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="o pega una URL de imagen, GIF o Giphy…"
              aria-label="URL de imagen o GIF"
              className="h-10 w-full rounded-xl border border-mist-300 bg-white pl-9 pr-3 text-sm text-mist-900 placeholder:text-mist-500 focus:border-palm-600 focus:outline-none focus:ring-2 focus:ring-palm-600/20"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const normalized = normalizeMollyUrl(urlDraft);
              if (!normalized) return;
              setUrl(normalized);
              setUrlDraft("");
              toast.success("Imagen enlazada");
            }}
            disabled={!urlDraft.trim()}
            className="pressable h-10 shrink-0 rounded-full border border-palm-700/30 bg-white px-4 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50 disabled:opacity-40"
          >
            Usar
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Upload múltiple: mantiene un JSON array de URLs en un hidden input. */
export function GalleryUpload({
  name,
  label,
  defaultValue = [],
  folder = "galeria",
  onChange,
}: {
  name: string;
  label?: string;
  defaultValue?: string[];
  folder?: string;
  onChange?: (urls: string[]) => void;
}) {
  const [urls, setUrlsState] = useState<string[]>(defaultValue);
  const setUrls = (updater: string[] | ((prev: string[]) => string[])) => {
    setUrlsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onChange?.(next);
      return next;
    });
  };
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error subiendo imagen");
        setUrls((prev) => [...prev, data.url]);
      }
      toast.success("Imágenes subidas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error subiendo imágenes");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-semibold text-mist-800">{label}</p> : null}
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-mist-200 bg-mist-100">
            <Image src={url} alt="" fill sizes="160px" className="object-cover" unoptimized={url.startsWith("/uploads")} />
            <button
              type="button"
              onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))}
              aria-label="Quitar imagen"
              className="pressable absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-mist-700 shadow-card hover:text-red-700"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-mist-300 bg-mist-50 text-[12px] font-medium text-mist-500 transition-colors hover:border-palm-500 hover:text-palm-700"
        >
          {uploading ? <Spinner size={20} className="animate-spin" /> : <UploadSimple size={20} />}
          {uploading ? "Subiendo…" : "Agregar"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void upload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
