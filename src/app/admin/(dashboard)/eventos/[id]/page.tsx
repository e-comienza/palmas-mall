import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { EventForm } from "../event-form";

export const metadata = { title: "Editar evento" };

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { id } = await params;
  const [event, sedes] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.sede.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!event || event.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editar: ${event.title}`}>
        <Link
          href={`/eventos/${event.slug}`}
          target="_blank"
          className="pressable inline-flex h-10 items-center rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-mist-700 hover:bg-mist-100"
        >
          Ver en el sitio ↗
        </Link>
      </AdminPageHeader>
      <EventForm event={event} sedes={sedes} canPublish={can.publish(user)} />
    </div>
  );
}
