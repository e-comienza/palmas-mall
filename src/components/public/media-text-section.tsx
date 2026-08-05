import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Media } from "./media";
import type { MediaTextData } from "@/lib/blocks";

/**
 * Sección "imagen + texto + botones" editable desde el admin (bloque MEDIA_TEXT).
 * Se usa tanto en el renderer de bloques como en páginas de sistema
 * (ej. Cómo llegar, Conoce Palmas Mall).
 * - Con `imageUrl2` muestra las dos fotos en collage.
 * - `variant="plain"` quita la tarjeta blanca, para secciones editoriales.
 */
export function MediaTextSection({
  data,
  variant = "card",
}: {
  data: MediaTextData;
  variant?: "card" | "plain";
}) {
  const buttons = (data.buttons ?? []).filter((b) => b.label && b.url);
  const imageFirst = data.imagePosition !== "right";

  const media = data.imageUrl2 ? (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mist-100">
        {data.imageUrl ? (
          <Media
            src={data.imageUrl}
            alt={data.imageAlt || ""}
            fill
            mode="inline"
            sizes="(max-width: 1024px) 50vw, 300px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl bg-mist-100">
        <Media
          src={data.imageUrl2}
          alt={data.imageAlt2 || ""}
          fill
          mode="inline"
          sizes="(max-width: 1024px) 50vw, 300px"
          className="object-cover"
        />
      </div>
    </div>
  ) : (
    <div className="relative min-h-[240px] overflow-hidden rounded-2xl bg-mist-100">
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
  );

  return (
    <div className={`grid gap-5 lg:grid-cols-2 ${variant === "plain" ? "lg:items-center lg:gap-10" : ""}`}>
      <div className={imageFirst ? "order-last lg:order-first" : "order-last"}>{media}</div>

      <div className={variant === "card" ? "rounded-2xl bg-white p-6 shadow-card sm:p-8" : ""}>
        {data.heading ? (
          <h2
            className={
              variant === "card"
                ? "font-display text-2xl font-bold tracking-[-0.02em] text-palm-950"
                : "font-display text-[1.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-palm-950 sm:text-4xl"
            }
          >
            {data.heading}
          </h2>
        ) : null}
        {data.body ? (
          <div
            className="prose-pm mt-5 text-[15px] leading-relaxed text-mist-700 sm:text-base"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        ) : null}
        {buttons.length ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {buttons.map((b, i) => {
              const external = /^https?:\/\//.test(b.url ?? "");
              const isLink = b.variant === "link";
              const className = isLink
                ? "inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
                : b.variant === "secondary"
                  ? "pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                  : "pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-palm-800";
              const content = (
                <>
                  {b.label}
                  {isLink ? <ArrowRight size={16} weight="bold" /> : null}
                </>
              );
              return external ? (
                <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <Link key={i} href={b.url ?? "#"} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
