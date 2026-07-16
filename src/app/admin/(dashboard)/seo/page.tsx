import Link from "next/link";
import { PencilSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "SEO" };

type Row = {
  id: string;
  title: string;
  path: string;
  editHref: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  noIndex?: boolean;
};

function SeoTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <AdminCard title={title} className="!p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
              <th className="px-5 py-3 font-semibold">Contenido</th>
              <th className="px-5 py-3 font-semibold">SEO title</th>
              <th className="px-5 py-3 font-semibold">Meta description</th>
              <th className="px-5 py-3 font-semibold">Indexación</th>
              <th className="px-5 py-3 text-right font-semibold">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-100">
            {rows.map((row) => {
              const titleOk = row.seoTitle.length > 0 && row.seoTitle.length <= 65;
              const descOk = row.seoDescription.length >= 50 && row.seoDescription.length <= 165;
              return (
                <tr key={row.id} className="align-top transition-colors hover:bg-mist-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-palm-950">{row.title}</p>
                    <p className="text-[12px] text-mist-500">{row.path}</p>
                  </td>
                  <td className="max-w-[220px] px-5 py-3">
                    <p className="flex items-start gap-1.5 text-mist-700">
                      {titleOk ? (
                        <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-palm-600" />
                      ) : (
                        <WarningCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
                      )}
                      <span className="line-clamp-2">{row.seoTitle || "Sin definir (usa el título)"}</span>
                    </p>
                  </td>
                  <td className="max-w-[280px] px-5 py-3">
                    <p className="flex items-start gap-1.5 text-mist-700">
                      {descOk ? (
                        <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-palm-600" />
                      ) : (
                        <WarningCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
                      )}
                      <span className="line-clamp-2">
                        {row.seoDescription || "Sin definir"}
                        {row.seoDescription ? ` (${row.seoDescription.length})` : ""}
                      </span>
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    {row.noIndex ? (
                      <Badge variant="danger">noindex</Badge>
                    ) : row.published ? (
                      <Badge>Indexable</Badge>
                    ) : (
                      <Badge variant="muted">No publicado</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={row.editHref}
                        aria-label={`Editar SEO de ${row.title}`}
                        className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                      >
                        <PencilSimple size={17} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

export default async function AdminSeoPage() {
  await requireUser("EDITOR");
  const [pages, locales, events, posts] = await Promise.all([
    prisma.page.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" } }),
    prisma.local.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.event.findMany({ where: { deletedAt: null }, orderBy: { startsAt: "desc" }, take: 30 }),
    prisma.blogPost.findMany({ where: { deletedAt: null }, orderBy: { publishedAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO manager"
        description="Revisa títulos, descripciones y estado de indexación de todo el contenido. Verde = dentro de los límites recomendados."
      />
      <SeoTable
        title="Páginas"
        rows={pages.map((p) => ({
          id: p.id,
          title: p.title,
          path: p.slug === "home" ? "/" : `/${p.slug}`,
          editHref: `/admin/paginas/${p.id}`,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          published: p.status === "PUBLISHED",
          noIndex: p.noIndex,
        }))}
      />
      <SeoTable
        title="Locales"
        rows={locales.map((l) => ({
          id: l.id,
          title: l.name,
          path: `/directorio/${l.slug}`,
          editHref: `/admin/locales/${l.id}`,
          seoTitle: l.seoTitle,
          seoDescription: l.seoDescription,
          published: l.status === "PUBLISHED",
        }))}
      />
      <SeoTable
        title="Eventos (últimos 30)"
        rows={events.map((e) => ({
          id: e.id,
          title: e.title,
          path: `/eventos/${e.slug}`,
          editHref: `/admin/eventos/${e.id}`,
          seoTitle: e.seoTitle,
          seoDescription: e.seoDescription,
          published: e.status === "PUBLISHED",
        }))}
      />
      <SeoTable
        title="Blog (últimos 30)"
        rows={posts.map((p) => ({
          id: p.id,
          title: p.title,
          path: `/blog/${p.slug}`,
          editHref: `/admin/blog/${p.id}`,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          published: p.status === "PUBLISHED",
        }))}
      />
    </div>
  );
}
