import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/ui";
import { GalleryManager } from "./gallery-manager";

export const metadata = { title: "Galería" };

export default async function AdminGaleriaPage() {
  await requireUser("EDITOR");
  const [albums, images] = await Promise.all([
    prisma.galleryAlbum.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
    }),
    prisma.galleryImage.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      include: { album: true },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Galería · Momentos Palmas Mall"
        description="Sube imágenes, organízalas en álbumes y elige cuáles aparecen en el home."
      />
      <GalleryManager
        albums={albums.map((a) => ({ id: a.id, title: a.title, description: a.description }))}
        images={images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          showOnHome: img.showOnHome,
          visible: img.status === "PUBLISHED",
          albumId: img.albumId,
          order: img.order,
        }))}
      />
    </div>
  );
}
