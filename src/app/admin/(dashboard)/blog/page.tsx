import Link from "next/link";
import Image from "next/image";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/admin/search-input";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { q } = await searchParams;

  const posts = await prisma.blogPost.findMany({
    where: {
      deletedAt: null,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  const deletePost = softDelete.bind(null, "blogPost");

  return (
    <div>
      <AdminPageHeader
        title="Blog y noticias"
        description="Artículos, guías y novedades del mall."
        createHref="/admin/blog/nuevo"
        createLabel="Nuevo post"
      >
        <SearchInput placeholder="Buscar post…" />
      </AdminPageHeader>

      {posts.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="px-5 py-3 font-semibold">Artículo</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {posts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-mist-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-mist-100">
                          {post.coverUrl ? (
                            <Image src={post.coverUrl} alt="" fill sizes="40px" className="object-cover" unoptimized={post.coverUrl.startsWith("/uploads")} />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[320px] truncate font-semibold text-palm-950">{post.title}</p>
                          <div className="mt-0.5 flex gap-1">
                            {post.featured ? <Badge variant="leaf">Destacado</Badge> : null}
                            {post.isPlaceholder ? <Badge variant="warning">Placeholder</Badge> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-mist-700">{post.category}</td>
                    <td className="px-5 py-3 text-mist-700">{formatDateShortEs(post.publishedAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={post.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          aria-label={`Editar ${post.title}`}
                          className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                        >
                          <PencilSimple size={17} />
                        </Link>
                        {can.delete(user) ? (
                          <DeleteButton action={deletePost} id={post.id} name={post.title} />
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
          title={q ? "Sin resultados" : "Aún no hay artículos"}
          hint={q ? `No encontramos posts con “${q}”.` : "Escribe la primera noticia del mall."}
          createHref={q ? undefined : "/admin/blog/nuevo"}
        />
      )}
    </div>
  );
}
