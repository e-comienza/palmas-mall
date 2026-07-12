"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilSimple } from "@phosphor-icons/react";
import {
  addGalleryImages,
  updateGalleryImage,
  upsertAlbum,
} from "@/app/admin/_actions/misc";
import { softDelete } from "@/app/admin/_actions/helpers";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { GalleryUpload } from "@/components/admin/image-upload";
import { DeleteButton } from "@/components/admin/action-buttons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type AlbumItem = { id: string; title: string; description: string };
type ImageItem = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  showOnHome: boolean;
  visible: boolean;
  albumId: string | null;
  order: number;
};

export function GalleryManager({
  albums,
  images,
}: {
  albums: AlbumItem[];
  images: ImageItem[];
}) {
  const [uploadState, uploadAction] = useActionState(addGalleryImages, initialFormState);
  const [albumState, albumAction] = useActionState(upsertAlbum, initialFormState);
  const [editing, setEditing] = useState<ImageItem | null>(null);
  const [filter, setFilter] = useState<string>("");

  const deleteImage = softDelete.bind(null, "galleryImage");
  const visible = filter ? images.filter((i) => i.albumId === filter) : images;

  return (
    <div className="space-y-6">
      <FormStateHandler state={uploadState} />
      <FormStateHandler state={albumState} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AdminCard title="Subir imágenes">
          <form action={uploadAction} className="space-y-4">
            <GalleryUpload name="urls" folder="galeria" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Álbum" htmlFor="albumId">
                <Select id="albumId" name="albumId" defaultValue={albums[0]?.id ?? ""}>
                  <option value="">Sin álbum</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Alt text (accesibilidad y SEO)" htmlFor="alt">
                <Input id="alt" name="alt" placeholder="Describe la imagen" />
              </Field>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-mist-800">Mostrar en el home</span>
              <Switch name="showOnHome" />
            </label>
            <SubmitButton>Guardar imágenes</SubmitButton>
          </form>
        </AdminCard>

        <AdminCard title="Crear álbum">
          <form action={albumAction} className="space-y-4">
            <Field label="Título del álbum" htmlFor="album-title">
              <Input id="album-title" name="title" placeholder="Feria Market 2026" required />
            </Field>
            <Field label="Descripción" htmlFor="album-desc">
              <Input id="album-desc" name="description" />
            </Field>
            <SubmitButton>Crear álbum</SubmitButton>
          </form>
          {albums.length ? (
            <ul className="mt-5 space-y-1.5 border-t border-mist-100 pt-4 text-sm">
              {albums.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-mist-700">
                  <span>{a.title}</span>
                  <span className="text-[12px] text-mist-500">
                    {images.filter((i) => i.albumId === a.id).length} imágenes
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </AdminCard>
      </div>

      <AdminCard title={`Imágenes (${visible.length})`}>
        <div className="mb-4 max-w-xs">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por álbum">
            <option value="">Todos los álbumes</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {visible.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-mist-200 bg-mist-100">
              <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" unoptimized={img.url.startsWith("/uploads")} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-palm-950/80 to-transparent p-2">
                <div className="flex gap-1">
                  {img.showOnHome ? <Badge variant="leaf" className="!px-1.5 !text-[10px]">Home</Badge> : null}
                  {!img.visible ? <Badge variant="muted" className="!px-1.5 !text-[10px]">Oculta</Badge> : null}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(img)}
                    aria-label="Editar imagen"
                    className="pressable flex size-8 items-center justify-center rounded-full bg-white/95 text-mist-700 shadow-card hover:text-palm-800"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <DeleteButton action={deleteImage} id={img.id} name={img.alt || "imagen"} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!visible.length ? (
          <p className="py-8 text-center text-sm text-mist-500">No hay imágenes en este filtro.</p>
        ) : null}
      </AdminCard>

      {editing ? (
        <EditImageDialog image={editing} albums={albums} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function EditImageDialog({
  image,
  albums,
  onClose,
}: {
  image: ImageItem;
  albums: AlbumItem[];
  onClose: () => void;
}) {
  const [state, action] = useActionState(updateGalleryImage, initialFormState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      toast.success("Imagen actualizada");
      onClose();
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>Editar imagen</DialogTitle>
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={image.id} />
          <input type="hidden" name="order" value={image.order} />
          <div className="relative aspect-video overflow-hidden rounded-xl bg-mist-100">
            <Image src={image.url} alt={image.alt} fill sizes="480px" className="object-cover" unoptimized={image.url.startsWith("/uploads")} />
          </div>
          <Field label="Alt text" htmlFor="edit-alt">
            <Input id="edit-alt" name="alt" defaultValue={image.alt} />
          </Field>
          <Field label="Caption (pie de foto)" htmlFor="edit-caption">
            <Input id="edit-caption" name="caption" defaultValue={image.caption} />
          </Field>
          <Field label="Álbum" htmlFor="edit-album">
            <Select id="edit-album" name="albumId" defaultValue={image.albumId ?? ""}>
              <option value="">Sin álbum</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-mist-800">Mostrar en el home</span>
            <Switch name="showOnHome" defaultChecked={image.showOnHome} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-mist-800">Visible</span>
            <Switch name="visible" defaultChecked={image.visible} />
          </label>
          <div className="flex justify-end">
            <SubmitButton>Guardar</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
