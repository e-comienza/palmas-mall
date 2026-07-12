import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FaqForm } from "../faq-form";

export const metadata = { title: "Nueva FAQ" };

export default async function NuevaFaqPage() {
  await requireUser("EDITOR");
  const [pages, locales, events] = await Promise.all([
    prisma.page.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.local.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.event.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { startsAt: "desc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Nueva FAQ" />
      <FaqForm
        pages={pages.map((p) => ({ id: p.id, label: p.title }))}
        locales={locales.map((l) => ({ id: l.id, label: l.name }))}
        events={events.map((e) => ({ id: e.id, label: e.title }))}
      />
    </div>
  );
}
