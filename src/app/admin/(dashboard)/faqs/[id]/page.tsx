import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FaqForm } from "../faq-form";

export const metadata = { title: "Editar FAQ" };

export default async function EditarFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("EDITOR");
  const { id } = await params;
  const [faq, pages, locales, events] = await Promise.all([
    prisma.faq.findUnique({ where: { id } }),
    prisma.page.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.local.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.event.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { startsAt: "desc" } }),
  ]);
  if (!faq || faq.deletedAt) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar FAQ" />
      <FaqForm
        faq={faq}
        pages={pages.map((p) => ({ id: p.id, label: p.title }))}
        locales={locales.map((l) => ({ id: l.id, label: l.name }))}
        events={events.map((e) => ({ id: e.id, label: e.title }))}
      />
    </div>
  );
}
