import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  await requireUser("EDITOR");
  const faqs = await prisma.faq.findMany({
    where: { deletedAt: null },
    orderBy: [{ scope: "asc" }, { order: "asc" }],
    include: {
      page: { select: { title: true } },
      local: { select: { name: true } },
      event: { select: { title: true } },
    },
  });

  const deleteFaq = softDelete.bind(null, "faq");

  const scopeLabel = (faq: (typeof faqs)[number]) => {
    switch (faq.scope) {
      case "GLOBAL":
        return <Badge>Global (AEO)</Badge>;
      case "PAGE":
        return <Badge variant="outline">Página: {faq.page?.title ?? "-"}</Badge>;
      case "LOCAL":
        return <Badge variant="outline">Local: {faq.local?.name ?? "-"}</Badge>;
      case "EVENT":
        return <Badge variant="outline">Evento: {faq.event?.title ?? "-"}</Badge>;
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Preguntas frecuentes"
        description="Las FAQs alimentan las secciones visibles y el schema FAQPage (Google, ChatGPT, Perplexity)."
        createHref="/admin/faqs/nueva"
        createLabel="Nueva FAQ"
      />
      {faqs.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <ul className="divide-y divide-mist-100">
            {faqs.map((faq) => (
              <li key={faq.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-palm-950">{faq.question}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-mist-600">{faq.answer}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {scopeLabel(faq)}
                    {!faq.visible ? <Badge variant="muted">Oculta</Badge> : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/faqs/${faq.id}`}
                    aria-label="Editar FAQ"
                    className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                  >
                    <PencilSimple size={17} />
                  </Link>
                  <DeleteButton action={deleteFaq} id={faq.id} name={faq.question} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          title="No hay FAQs"
          hint="Crea preguntas frecuentes para mejorar el SEO y el AEO del sitio."
          createHref="/admin/faqs/nueva"
        />
      )}
    </div>
  );
}
