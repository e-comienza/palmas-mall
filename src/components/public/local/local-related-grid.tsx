import type { Local, LocalCategory } from "@prisma/client";
import { SectionTitle } from "@/components/public/container";
import { LocalCard } from "@/components/public/cards";

/** Locales relacionados por categoría. */
export function LocalRelatedGrid({
  locales,
}: {
  locales: (Local & { category: LocalCategory | null })[];
}) {
  if (!locales.length) return null;
  return (
    <div className="mt-16 sm:mt-20">
      <SectionTitle title="También te puede gustar" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {locales.map((local) => (
          <LocalCard key={local.id} local={local} />
        ))}
      </div>
    </div>
  );
}
