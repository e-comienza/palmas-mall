import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { getGalleryAlbums, getPage } from "@/lib/queries";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";
import { webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("momentos-palmas-mall", "/momentos-palmas-mall");
}

export default async function MomentosPage() {
  const [albums, page] = await Promise.all([
    getGalleryAlbums(),
    getPage("momentos-palmas-mall"),
  ]);
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/momentos-palmas-mall",
          name: hero.heading || "Momentos Palmas Mall",
          description: page?.seoDescription,
        })}
      />
      <PageHeader
        title={hero.heading || "Momentos Palmas Mall"}
        intro={hero.subheading || "Ferias, gastronomía, moda, familia y noches inolvidables: toca cualquier foto para verla en grande."}
        crumbs={[{ name: "Momentos", path: "/momentos-palmas-mall" }]}
      />
      <Container className="py-10 sm:py-14">
        {albums.length ? (
          <div className="space-y-14">
            {albums.map((album) => (
              <section key={album.id} aria-label={album.title}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-[28px]">
                    {album.title}
                  </h2>
                  {album.description ? (
                    <p className="mt-1.5 max-w-[65ch] text-[15px] leading-relaxed text-mist-600">{album.description}</p>
                  ) : null}
                </div>
                <LightboxGallery
                  images={album.images.map((img) => ({
                    url: img.url,
                    alt: img.alt || "Momentos en Palmas Mall",
                    caption: img.caption || undefined,
                  }))}
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
            <p className="font-display text-xl font-bold text-palm-950">Galería en construcción</p>
            <p className="mt-2 text-sm text-mist-600">Pronto compartiremos los mejores momentos.</p>
          </div>
        )}
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
