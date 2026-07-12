import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { LocalForm } from "../local-form";

export const metadata = { title: "Nuevo local" };

export default async function NuevoLocalPage() {
  const user = await requireUser("EDITOR");
  const [categories, sedes] = await Promise.all([
    prisma.localCategory.findMany({ orderBy: { order: "asc" } }),
    prisma.sede.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Nuevo local" description="Crea un local del directorio." />
      <LocalForm categories={categories} sedes={sedes} canPublish={can.publish(user)} />
    </div>
  );
}
