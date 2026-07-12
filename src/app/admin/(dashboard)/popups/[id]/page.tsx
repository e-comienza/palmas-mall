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
  const popup = await prisma.popup.findUnique({ where: { id } });
  if (!popup || popup.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editar: ${popup.internalName}`} />
      <PopupForm popup={popup} />
    </div>
  );
}
