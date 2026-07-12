import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { EventForm } from "../event-form";

export const metadata = { title: "Nuevo evento" };

export default async function NuevoEventoPage() {
  const user = await requireUser("EDITOR");
  const sedes = await prisma.sede.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Nuevo evento" />
      <EventForm sedes={sedes} canPublish={can.publish(user)} />
    </div>
  );
}
