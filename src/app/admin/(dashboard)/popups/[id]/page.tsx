import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PopupForm } from "../popup-form";

export const metadata = { title: "Editar popup" };

export default async function EditarPopupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("ADMIN");
  const { id } = await params;
  const [popup, events] = await Promise.all([
    prisma.popup.findUnique({ where: { id } }),
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { startsAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!popup || popup.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editar: ${popup.internalName}`} />
      <PopupForm popup={popup} events={events} />
    </div>
  );
}
