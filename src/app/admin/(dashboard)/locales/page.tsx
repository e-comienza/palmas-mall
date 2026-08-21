import Image from "next/image";
import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";
import { DeleteButton, MoveButtons } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { moveLocal } from "@/app/admin/_actions/misc";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/admin/search-input";
import { cn } from "@/lib/utils";

export const metadata = { title: "Locales" };

export default async function AdminLocalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { q, categoria } = await searchParams;

  const [locales, categories] = await Promise.all([
    prisma.local.findMany({
      where: {
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      include: { category: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.localCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  const deleteLocal = softDelete.bind(null, "local");

  // El orden se intercambia dentro de la lista que se está viendo, así que la
  // acción necesita saber con qué filtros se dibujó.
  async function move(id: string, dir: -1 | 1) {
    "use server";
    return moveLocal(id, dir, { q, categoria });
  }

  const chipHref = (slug?: string) => {
    const sp = new URLSearchParams();
    if (slug) sp.set("categoria", slug);
    if (q) sp.set("q", q);
    return sp.size ? `/admin/locales?${sp}` : "/admin/locales";
  };

  return (
    <div>
      <AdminPageHeader
        title="Locales"
        description="Restaurantes, tiendas y servicios del mall. Este orden es el que se ve en el Directorio; con una categoría seleccionada, las flechas mueven el local dentro de esa categoría."
        createHref="/admin/locales/nuevo"
        createLabel="Nuevo local"
      >
        <SearchInput placeholder="Buscar local…" />
      </AdminPageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {[{ slug: undefined, name: "Todas las categorías" }, ...categories].map((c) => {
          const active = (categoria ?? undefined) === c.slug;
          return (
            <Link
              key={c.slug ?? "all"}
              href={chipHref(c.slug)}
              aria-current={active}
              className={cn(
                "pressable inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold transition-colors",
                active
                  ? "border-palm-700 bg-palm-700 text-white"
                  : "border-mist-300 bg-white text-mist-700 hover:border-palm-500 hover:text-palm-800",
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {locales.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Orden</span>
                  </th>
                  <th className="px-5 py-3 font-semibold">Local</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Etiquetas</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {locales.map((local, i) => (
                  <tr key={local.id} className="transition-colors hover:bg-mist-50">
                    <td className="px-2 py-3">
                      <MoveButtons
                        action={move}
                        id={local.id}
                        name={local.name}
                        isFirst={i === 0}
                        isLast={i === locales.length - 1}
                      />
                    </td>
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
                        {local.featured ? <Badge variant="leaf">Nuevo</Badge> : null}
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
          title={q || categoria ? "Sin resultados" : "Aún no hay locales"}
          hint={
            q
              ? `No encontramos locales con “${q}”.`
              : categoria
                ? "No hay locales en esta categoría."
                : "Crea el primer local del directorio."
          }
          createHref={q || categoria ? undefined : "/admin/locales/nuevo"}
        />
      )}
    </div>
  );
}
