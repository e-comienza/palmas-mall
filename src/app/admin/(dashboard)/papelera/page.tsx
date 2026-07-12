import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, AdminCard, EmptyState } from "@/components/admin/ui";
import { RestoreButton, DeleteButton } from "@/components/admin/action-buttons";
import { restoreItem, destroyItem, type TrashableEntity } from "@/app/admin/_actions/helpers";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Papelera" };

type TrashRow = {
  id: string;
  name: string;
  deletedAt: Date;
  deletedBy: string | null;
  entity: TrashableEntity;
  entityLabel: string;
};

export default async function AdminPapeleraPage() {
  const user = await requireUser("ADMIN");

  const [locales, events, posts, pages, popups, images, faqs, messages] = await Promise.all([
    prisma.local.findMany({ where: { deletedAt: { not: null } } }),
    prisma.event.findMany({ where: { deletedAt: { not: null } } }),
    prisma.blogPost.findMany({ where: { deletedAt: { not: null } } }),
    prisma.page.findMany({ where: { deletedAt: { not: null } } }),
    prisma.popup.findMany({ where: { deletedAt: { not: null } } }),
    prisma.galleryImage.findMany({ where: { deletedAt: { not: null } } }),
    prisma.faq.findMany({ where: { deletedAt: { not: null } } }),
    prisma.contactMessage.findMany({ where: { deletedAt: { not: null } } }),
  ]);

  const rows: TrashRow[] = [
    ...locales.map((r) => ({ id: r.id, name: r.name, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "local" as const, entityLabel: "Local" })),
    ...events.map((r) => ({ id: r.id, name: r.title, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "event" as const, entityLabel: "Evento" })),
    ...posts.map((r) => ({ id: r.id, name: r.title, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "blogPost" as const, entityLabel: "Post" })),
    ...pages.map((r) => ({ id: r.id, name: r.title, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "page" as const, entityLabel: "Página" })),
    ...popups.map((r) => ({ id: r.id, name: r.internalName, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "popup" as const, entityLabel: "Popup" })),
    ...images.map((r) => ({ id: r.id, name: r.alt || r.url.split("/").pop() || "imagen", deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "galleryImage" as const, entityLabel: "Imagen" })),
    ...faqs.map((r) => ({ id: r.id, name: r.question, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "faq" as const, entityLabel: "FAQ" })),
    ...messages.map((r) => ({ id: r.id, name: `Mensaje de ${r.name}`, deletedAt: r.deletedAt!, deletedBy: r.deletedBy, entity: "contactMessage" as const, entityLabel: "Mensaje" })),
  ].sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

  return (
    <div>
      <AdminPageHeader
        title="Papelera"
        description="Restaura contenido eliminado. La eliminación definitiva solo está disponible para Super Admin."
      />
      {rows.length ? (
        <AdminCard className="!p-0">
          <ul className="divide-y divide-mist-100">
            {rows.map((row) => (
              <li key={`${row.entity}-${row.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-palm-950">
                    <span className="mr-2 rounded-full bg-mist-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mist-600">
                      {row.entityLabel}
                    </span>
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-mist-500">
                    Eliminado el {formatDateShortEs(row.deletedAt)}
                    {row.deletedBy ? ` por ${row.deletedBy}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RestoreButton action={restoreItem.bind(null, row.entity)} id={row.id} />
                  {can.destroy(user) ? (
                    <DeleteButton
                      action={destroyItem.bind(null, row.entity)}
                      id={row.id}
                      name={row.name}
                      permanent
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : (
        <EmptyState title="La papelera está vacía" hint="Aquí aparece el contenido eliminado, listo para restaurar." />
      )}
    </div>
  );
}
