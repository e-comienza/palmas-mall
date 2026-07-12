import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { getGalleryAlbums } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("momentos-palmas-mall", "/momentos-palmas-mall");
}

export default async function MomentosPage() {
  const albums = await getGalleryAlbums();

  return (
    <>
      <PageHeader
        title="Momentos Palmas Mall"
        intro="Ferias, gastronomía, moda, familia y noches inolvidables: toca cualquier foto para verla en grande."
        crumbs={[{ name: "Momentos", path: "/momentos-palmas-mall" }]}
      />
      <Container className="py-10 sm:py-14">
        {albums.length ? (
          <div className="space-y-14">
            {albums.map((album) => (
              <section key={album.id} aria-label={album.title}>
                {albums.length > 1 ? (
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
                      {album.title}
                    </h2>
                    {album.description ? (
                      <p className="mt-1.5 max-w-[60ch] text-sm text-mist-600">{album.description}</p>
                    ) : null}
                  </div>
                ) : null}
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
    </>
  );
}
