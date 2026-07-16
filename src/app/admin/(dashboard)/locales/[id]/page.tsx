import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { LocalForm } from "../local-form";

export const metadata = { title: "Editar local" };

export default async function EditarLocalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { id } = await params;
  const [local, categories, sedes] = await Promise.all([
    prisma.local.findUnique({ where: { id } }),
    prisma.localCategory.findMany({ orderBy: { order: "asc" } }),
    prisma.sede.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!local || local.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editar: ${local.name}`}>
        <Link
          href={`/directorio/${local.slug}`}
          target="_blank"
          className="pressable inline-flex h-10 items-center rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-mist-700 hover:bg-mist-100"
        >
          Ver en el sitio ↗
        </Link>
      </AdminPageHeader>
      <LocalForm local={local} categories={categories} sedes={sedes} canPublish={can.publish(user)} />
    </div>
  );
}
