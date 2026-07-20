import { Container } from "./container";
import { Breadcrumbs } from "./breadcrumbs";
import { withHeart } from "@/lib/heart-text";

/** Cabecera estándar de páginas internas (deja espacio bajo el header fijo). */
export function PageHeader({
  title,
  intro,
  crumbs,
  children,
}: {
  title: string;
  intro?: string;
  crumbs: { name: string; path: string }[];
  children?: React.ReactNode;
}) {
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
