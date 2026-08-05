import Link from "next/link";
import { Media } from "./media";
import type { MediaTextData } from "@/lib/blocks";

/**
 * Sección "imagen + texto + botones" editable desde el admin (bloque MEDIA_TEXT).
 * Se usa tanto en el renderer de bloques como en páginas de sistema (ej. Cómo llegar).
 */
export function MediaTextSection({ data }: { data: MediaTextData }) {
  const buttons = (data.buttons ?? []).filter((b) => b.label && b.url);
  const imageFirst = data.imagePosition !== "right";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div
        className={`relative min-h-[240px] overflow-hidden rounded-2xl bg-mist-100 ${
          imageFirst ? "order-last lg:order-first" : "order-last"
        }`}
      >
        {data.imageUrl ? (
          <Media
            src={data.imageUrl}
            alt={data.imageAlt || data.heading || ""}
            fill
            mode="inline"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        {data.heading ? (
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
            {data.heading}
          </h2>
        ) : null}
        {data.body ? (
          <div
            className="prose-pm mt-5 text-[15px] text-mist-700"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        ) : null}
        {buttons.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {buttons.map((b, i) => {
              const external = /^https?:\/\//.test(b.url ?? "");
              const className =
                b.variant === "secondary"
                  ? "pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                  : "pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-palm-800";
              return external ? (
                <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className={className}>
                  {b.label}
                </a>
              ) : (
                <Link key={i} href={b.url ?? "#"} className={className}>
                  {b.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
