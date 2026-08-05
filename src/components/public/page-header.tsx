import { Container } from "./container";
import { Breadcrumbs } from "./breadcrumbs";
import { Media } from "./media";
import { withHeart } from "@/lib/heart-text";

/**
 * Cabecera estándar de páginas internas (deja espacio bajo el header fijo).
 * Con `imageUrl` (imagen del bloque Hero en el admin) se vuelve un banner con foto.
 */
export function PageHeader({
  title,
  intro,
  crumbs,
  imageUrl,
  children,
}: {
  title: string;
  intro?: string;
  crumbs: { name: string; path: string }[];
  imageUrl?: string;
  children?: React.ReactNode;
}) {
  if (imageUrl) {
    return (
      <div className="relative overflow-hidden bg-palm-950 pb-10 pt-12 sm:pb-14 sm:pt-16">
        <Media
          src={imageUrl}
          alt=""
          fill
          mode="background"
          sizes="100vw"
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-palm-950/90 via-palm-950/55 to-palm-950/40" />
        <Container className="relative">
          <Breadcrumbs items={crumbs} tone="light" />
          <h1
            data-speakable
            className="mt-4 font-display text-[2.1rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl"
          >
            {title}
          </h1>
          {intro ? (
            <p
              data-speakable
              className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/85 sm:text-lg"
            >
              {withHeart(intro)}
            </p>
          ) : null}
          {children}
        </Container>
      </div>
    );
  }

  return (
    <div className="border-b border-mist-200 bg-white pb-8 pt-10 sm:pb-12 sm:pt-14">
      <Container>
        <Breadcrumbs items={crumbs} />
        <h1
          data-speakable
          className="mt-4 font-display text-[2.1rem] font-bold leading-[1.08] tracking-[-0.02em] text-palm-950 sm:text-5xl"
        >
          {title}
        </h1>
        {intro ? (
          <p
            data-speakable
            className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mist-600 sm:text-lg"
          >
            {withHeart(intro)}
          </p>
        ) : null}
        {children}
      </Container>
    </div>
  );
}
