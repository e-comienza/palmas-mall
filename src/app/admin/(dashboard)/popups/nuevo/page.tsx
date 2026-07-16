import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PopupForm } from "../popup-form";

export const metadata = { title: "Nuevo popup" };

export default async function NuevoPopupPage() {
  await requireUser("ADMIN");
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: "desc" },
    select: { id: true, title: true },
  });
  return (
    <div>
      <AdminPageHeader title="Nuevo popup" />
      <PopupForm events={events} />
    </div>
  );
}
