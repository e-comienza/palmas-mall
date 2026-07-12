import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { Badge } from "@/components/ui/badge";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Popups" };

const PLACEMENT_LABEL: Record<string, string> = {
  ALL: "Todas las páginas",
  HOME: "Home",
  LOCALES: "Locales",
  EVENTOS: "Eventos",
  BLOG: "Blog",
  CUSTOM: "Ruta personalizada",
};

export default async function AdminPopupsPage() {
  await requireUser("ADMIN");
  const popups = await prisma.popup.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  const deletePopup = softDelete.bind(null, "popup");

  return (
    <div>
      <AdminPageHeader
        title="Popups"
        description="Avisos configurables para los visitantes: no invasivos y fáciles de cerrar."
        createHref="/admin/popups/nuevo"
        createLabel="Nuevo popup"
      />
      {popups.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="px-5 py-3 font-semibold">Popup</th>
                  <th className="px-5 py-3 font-semibold">Aparece en</th>
                  <th className="px-5 py-3 font-semibold">Vigencia</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {popups.map((popup) => (
                  <tr key={popup.id} className="transition-colors hover:bg-mist-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-palm-950">{popup.internalName}</p>
                      <p className="text-[12px] text-mist-500">{popup.title || "Sin título visible"}</p>
                    </td>
                    <td className="px-5 py-3 text-mist-700">
                      {PLACEMENT_LABEL[popup.placement]}
                      {popup.placement === "CUSTOM" ? ` (${popup.customPath})` : ""}
                    </td>
                    <td className="px-5 py-3 text-mist-700">
                      {popup.startsAt ? formatDateShortEs(popup.startsAt) : "Siempre"}
                      {popup.endsAt ? ` → ${formatDateShortEs(popup.endsAt)}` : ""}
                    </td>
                    <td className="px-5 py-3">
                      {popup.active ? <Badge variant="leaf">Activo</Badge> : <Badge variant="muted">Inactivo</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/popups/${popup.id}`}
                          aria-label={`Editar ${popup.internalName}`}
                          className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                        >
                          <PencilSimple size={17} />
                        </Link>
                        <DeleteButton action={deletePopup} id={popup.id} name={popup.internalName} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No hay popups"
          hint="Crea un popup para anunciar eventos, promociones o novedades."
          createHref="/admin/popups/nuevo"
        />
      )}
    </div>
  );
}
