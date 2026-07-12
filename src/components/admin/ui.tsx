import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@prisma/client";

export function AdminPageHeader({
  title,
  description,
  createHref,
  createLabel,
  children,
}: {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em] text-palm-950">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-mist-600">{description}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {createHref ? (
          <Link
            href={createHref}
            className="pressable inline-flex h-10 items-center gap-2 rounded-full bg-palm-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
          >
            <Plus size={16} weight="bold" /> {createLabel ?? "Crear"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  switch (status) {
    case "PUBLISHED":
      return <Badge>Publicado</Badge>;
    case "DRAFT":
      return <Badge variant="warning">Borrador</Badge>;
    case "HIDDEN":
      return <Badge variant="muted">Oculto</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archivado</Badge>;
  }
}

export function EmptyState({
  title,
  hint,
  createHref,
  createLabel,
}: {
  title: string;
  hint?: string;
  createHref?: string;
  createLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
      <p className="font-display text-lg font-bold text-palm-950">{title}</p>
      {hint ? <p className="mx-auto mt-2 max-w-[46ch] text-sm text-mist-600">{hint}</p> : null}
      {createHref ? (
        <Link
          href={createHref}
          className="pressable mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-palm-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
        >
          <Plus size={16} weight="bold" /> {createLabel ?? "Crear el primero"}
        </Link>
      ) : null}
    </div>
  );
}

export function AdminCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-card ${className ?? ""}`}>
      {title ? (
        <h2 className="mb-4 font-display text-[16px] font-bold text-palm-950">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
