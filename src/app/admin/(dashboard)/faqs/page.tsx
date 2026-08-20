import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { FaqScope, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { SearchInput } from "@/components/admin/search-input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "FAQs" };

const SCOPES: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "GLOBAL", label: "Globales" },
  { value: "PAGE", label: "De páginas" },
  { value: "LOCAL", label: "De locales" },
  { value: "EVENT", label: "De eventos" },
];

const isScope = (v?: string): v is FaqScope =>
  v === "GLOBAL" || v === "PAGE" || v === "LOCAL" || v === "EVENT";

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; scope?: string }>;
}) {
  await requireUser("EDITOR");
  const { q, scope } = await searchParams;

  const where: Prisma.FaqWhereInput = {
    deletedAt: null,
    ...(isScope(scope) ? { scope } : {}),
    ...(q
      ? {
          OR: [
            { question: { contains: q, mode: "insensitive" } },
            { answer: { contains: q, mode: "insensitive" } },
            { page: { title: { contains: q, mode: "insensitive" } } },
            { local: { name: { contains: q, mode: "insensitive" } } },
            { event: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [faqs, totals] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: [{ scope: "asc" }, { order: "asc" }, { question: "asc" }],
      include: {
        page: { select: { title: true } },
        local: { select: { name: true } },
        event: { select: { title: true } },
      },
    }),
    prisma.faq.groupBy({ by: ["scope"], where: { deletedAt: null }, _count: true }),
  ]);

  const deleteFaq = softDelete.bind(null, "faq");
  const countBy = (s: string) =>
    s === ""
      ? totals.reduce((sum, t) => sum + t._count, 0)
      : (totals.find((t) => t.scope === s)?._count ?? 0);

  // Agrupadas por dónde salen: así una FAQ de la página Contacto se encuentra
  // buscando "Contacto", no leyendo una lista plana de cincuenta preguntas.
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const key =
      faq.scope === "GLOBAL"
        ? "Globales · home y respuestas para buscadores"
        : faq.scope === "PAGE"
          ? `Página · ${faq.page?.title ?? "sin página"}`
          : faq.scope === "LOCAL"
            ? `Local · ${faq.local?.name ?? "sin local"}`
            : `Evento · ${faq.event?.title ?? "sin evento"}`;
    groups.set(key, [...(groups.get(key) ?? []), faq]);
  }

  return (
    <div>
      <AdminPageHeader
        title="Preguntas frecuentes"
        description="Todas las FAQs del sitio se editan aquí, agrupadas por dónde salen. Alimentan las secciones visibles y el schema FAQPage (Google, ChatGPT, Perplexity)."
        createHref="/admin/faqs/nueva"
        createLabel="Nueva FAQ"
      >
        <SearchInput placeholder="Buscar pregunta…" />
      </AdminPageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {SCOPES.map((s) => {
          const active = (scope ?? "") === s.value;
          const sp = new URLSearchParams();
          if (s.value) sp.set("scope", s.value);
          if (q) sp.set("q", q);
          const href = sp.size ? `/admin/faqs?${sp}` : "/admin/faqs";
          return (
            <Link
              key={s.value || "all"}
              href={href}
              aria-current={active}
              className={cn(
                "pressable inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors",
                active
                  ? "border-palm-700 bg-palm-700 text-white"
                  : "border-mist-300 bg-white text-mist-700 hover:border-palm-500 hover:text-palm-800",
              )}
            >
              {s.label}
              <span className={cn("tabular-nums", active ? "text-white/70" : "text-mist-500")}>
                {countBy(s.value)}
              </span>
            </Link>
          );
        })}
      </div>

      {faqs.length ? (
        <div className="space-y-5">
          {[...groups].map(([title, items]) => (
            <div key={title} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-baseline justify-between gap-3 border-b border-mist-100 px-5 py-3">
                <h2 className="font-display text-[15px] font-bold text-palm-950">{title}</h2>
                <span className="text-[12px] tabular-nums text-mist-500">
                  {items.length} {items.length === 1 ? "pregunta" : "preguntas"}
                </span>
              </div>
              <ul className="divide-y divide-mist-100">
                {items.map((faq) => (
                  <li key={faq.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-palm-950">{faq.question}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-mist-600">{faq.answer}</p>
                      {!faq.visible ? (
                        <Badge variant="muted" className="mt-1.5">
                          Oculta
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/admin/faqs/${faq.id}`}
                        aria-label={`Editar: ${faq.question}`}
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
          ))}
        </div>
      ) : (
        <EmptyState
          title={q || scope ? "Sin resultados" : "No hay FAQs"}
          hint={
            q
              ? `Ninguna pregunta coincide con “${q}”.`
              : scope
                ? "No hay FAQs en este grupo. Prueba con otro filtro."
                : "Crea preguntas frecuentes para mejorar el SEO y el AEO del sitio."
          }
          createHref={q || scope ? undefined : "/admin/faqs/nueva"}
        />
      )}
    </div>
  );
}
