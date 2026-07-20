import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Confetti, Baby, Balloon } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { Media } from "@/components/public/media";
import { getPage } from "@/lib/queries";
import { heroData, richTextData } from "@/lib/blocks";
import { pageMetadata } from "@/lib/page-metadata";
import { webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { PageFaqs } from "@/components/public/page-faqs";
import { ExtraBlocks } from "@/components/public/block-renderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("play-zone", "/play-zone");
}

const HIGHLIGHTS = [
  { icon: Baby, title: "Pensado para los peques", text: "Un espacio seguro y a su medida para jugar sin preocupaciones." },
  { icon: Confetti, title: "Diversión todos los días", text: "El plan favorito de los niños mientras la familia disfruta el mall." },
  { icon: Balloon, title: "Plan en familia", text: "A un paso del Food Hall, las tiendas y las terrazas a cielo abierto." },
];

export default async function PlayZonePage() {
  const page = await getPage("play-zone");
  const hero = heroData(page);
  const intro = richTextData(page);
  const videoBlock = page?.blocks.find((b) => b.type === "VIDEO");
  const videoUrl = (videoBlock?.data as { url?: string } | undefined)?.url;

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/play-zone",
          name: hero.heading || "PlayZone",
          description: page?.seoDescription,
        })}
      />
      <PageHeader
        title={hero.heading || "PlayZone"}
        intro={hero.subheading || "La zona de juegos donde los peques viven Palmas Mall a su manera."}
        crumbs={[{ name: "PlayZone", path: "/play-zone" }]}
      />

      <Container className="py-10 sm:py-14">
        {videoUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-palm-950 shadow-card">
            <Media src={videoUrl} alt={hero.heading || "PlayZone Palmas Mall"} fill mode="inline" className="object-cover" />
          </div>
        ) : null}

        {intro.body ? (
          <div className="mx-auto mt-10 max-w-3xl">
            {intro.heading ? (
              <h2 className="mb-3 text-balance font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
                {intro.heading}
              </h2>
            ) : null}
            <div className="prose-pm text-mist-700" dangerouslySetInnerHTML={{ __html: intro.body }} />
          </div>
        ) : null}

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-2xl bg-white p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-full bg-palm-100 text-palm-700">
                <h.icon size={22} weight="duotone" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-palm-950">{h.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{h.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            href="/eventos"
            className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-palm-700 px-7 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
          >
            Ver planes en familia <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            href="/como-llegar"
            className="pressable inline-flex h-12 items-center rounded-full border border-palm-700/30 bg-white px-7 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
          >
            Cómo llegar
          </Link>
        </div>
      </Container>

      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} consumed={["HERO", "RICH_TEXT", "VIDEO"]} />
    </>
  );
}
