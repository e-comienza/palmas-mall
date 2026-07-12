import Image from "next/image";
import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/admin/search-input";

export const metadata = { title: "Locales" };

export default async function AdminLocalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { q } = await searchParams;

  const locales = await prisma.local.findMany({
    where: {
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { category: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const deleteLocal = softDelete.bind(null, "local");

  return (
    <div>
      <AdminPageHeader
        title="Locales"
        description="Restaurantes, tiendas y servicios del mall."
        createHref="/admin/locales/nuevo"
        createLabel="Nuevo local"
      >
        <SearchInput placeholder="Buscar local…" />
      </AdminPageHeader>

      {locales.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="px-5 py-3 font-semibold">Local</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Etiquetas</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {locales.map((local) => (
                  <tr key={local.id} className="transition-colors hover:bg-mist-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-mist-100">
                          {local.coverUrl ? (
                            <Image src={local.coverUrl} alt="" fill sizes="40px" className="object-cover" unoptimized={local.coverUrl.startsWith("/uploads")} />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-palm-950">{local.name}</p>
                          <p className="text-[12px] text-mist-500">/{local.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-mist-700">{local.category?.name ?? "-"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={local.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {local.featured ? <Badge variant="leaf">Destacado</Badge> : null}
                        {local.comingSoon ? <Badge variant="dark">Próximamente</Badge> : null}
                        {local.isPlaceholder ? <Badge variant="warning">Placeholder</Badge> : null}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/locales/${local.id}`}
                          aria-label={`Editar ${local.name}`}
                          className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 transition-colors hover:bg-palm-50 hover:text-palm-800"
                        >
                          <PencilSimple size={17} />
                        </Link>
                        {can.delete(user) ? (
                          <DeleteButton action={deleteLocal} id={local.id} name={local.name} />
                        ) : null}
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
          title={q ? "Sin resultados" : "Aún no hay locales"}
          hint={q ? `No encontramos locales con “${q}”.` : "Crea el primer local del directorio."}
          createHref={q ? undefined : "/admin/locales/nuevo"}
        />
      )}
    </div>
  );
}
