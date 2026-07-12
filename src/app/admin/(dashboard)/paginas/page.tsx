import Link from "next/link";
import { PencilSimple, Lock } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";

export const metadata = { title: "Páginas" };

export default async function AdminPaginasPage() {
  const user = await requireUser("EDITOR");
  const pages = await prisma.page.findMany({
    where: { deletedAt: null },
    orderBy: [{ system: "desc" }, { title: "asc" }],
    include: { _count: { select: { blocks: true, faqs: true } } },
  });

  const deletePage = softDelete.bind(null, "page");

  return (
    <div>
      <AdminPageHeader
        title="Páginas"
        description="Las páginas de sistema alimentan las secciones del sitio; también puedes crear páginas nuevas con bloques."
        createHref="/admin/paginas/nueva"
        createLabel="Nueva página"
      />
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                <th className="px-5 py-3 font-semibold">Página</th>
                <th className="px-5 py-3 font-semibold">URL</th>
                <th className="px-5 py-3 font-semibold">Contenido</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {pages.map((page) => (
                <tr key={page.id} className="transition-colors hover:bg-mist-50">
                  <td className="px-5 py-3">
                    <p className="flex items-center gap-2 font-semibold text-palm-950">
                      {page.title}
                      {page.system ? (
                        <span title="Página de sistema: su URL es fija">
                          <Lock size={13} className="text-mist-400" />
                        </span>
                      ) : null}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-mist-600">
                    /{page.slug === "home" ? "" : page.slug}
                  </td>
                  <td className="px-5 py-3 text-mist-600">
                    {page._count.blocks} bloques · {page._count.faqs} FAQs
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={page.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/paginas/${page.id}`}
                        aria-label={`Editar ${page.title}`}
                        className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                      >
                        <PencilSimple size={17} />
                      </Link>
                      {!page.system && can.delete(user) ? (
                        <DeleteButton action={deletePage} id={page.id} name={page.title} />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
