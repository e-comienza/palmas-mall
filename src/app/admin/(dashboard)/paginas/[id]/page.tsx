import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PageForm } from "../page-form";

export const metadata = { title: "Editar página" };

export default async function EditarPaginaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!page || page.deletedAt) notFound();

  const publicPath = page.slug === "home" ? "/" : `/${page.slug}`;

  return (
    <div>
      <AdminPageHeader title={`Editar: ${page.title}`}>
        <Link
          href={publicPath}
          target="_blank"
          className="pressable inline-flex h-10 items-center rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-mist-700 hover:bg-mist-100"
        >
          Ver en el sitio ↗
        </Link>
      </AdminPageHeader>
      <PageForm page={page} canPublish={can.publish(user)} />
    </div>
  );
}
