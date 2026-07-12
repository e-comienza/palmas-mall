"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string; group: string };

/**
 * Filtros del directorio: búsqueda con debounce + chips de categoría.
 * Navega con query params para que las URLs sean compartibles e indexables.
 */
export function LocalesFilter({
  categories,
  activeCategory,
  activeGroup,
  query,
}: {
  categories: Category[];
  activeCategory?: string;
  activeGroup?: string;
  query?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(query ?? "");
  const [, startTransition] = useTransition();
  const first = useRef(true);

  const navigate = (params: { categoria?: string; grupo?: string; q?: string }) => {
    const sp = new URLSearchParams();
    if (params.categoria) sp.set("categoria", params.categoria);
    if (params.grupo) sp.set("grupo", params.grupo);
    if (params.q) sp.set("q", params.q);
    startTransition(() => {
      router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
    });
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      navigate({ categoria: activeCategory, grupo: activeGroup, q: q || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const groups = [
    { key: undefined, label: "Todos" },
    { key: "food-drinks", label: "Food & Drinks" },
    { key: "shop-more", label: "Shop & More" },
  ];

  const visibleCategories = activeGroup
    ? categories.filter((c) => c.group === activeGroup)
    : categories;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar un local, restaurante o marca…"
          aria-label="Buscar local"
          className="h-12 w-full rounded-full border border-mist-300 bg-white pl-11 pr-4 text-[15px] text-mist-900 placeholder:text-mist-500 focus:border-palm-600 focus:outline-none focus:ring-2 focus:ring-palm-600/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g) => (
          <button
            key={g.label}
            type="button"
            onClick={() => navigate({ grupo: g.key, q: q || undefined })}
            className={cn(
              "pressable h-10 rounded-full px-4 text-sm font-semibold transition-colors",
              (activeGroup ?? undefined) === g.key && !activeCategory
                ? "bg-palm-700 text-white"
                : "bg-white text-mist-700 shadow-card hover:bg-palm-50",
            )}
          >
            {g.label}
          </button>
        ))}
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-mist-300 sm:block" />
        {visibleCategories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() =>
              navigate({
                categoria: activeCategory === c.slug ? undefined : c.slug,
                q: q || undefined,
              })
            }
            className={cn(
              "pressable h-10 rounded-full px-4 text-sm font-semibold transition-colors",
              activeCategory === c.slug
                ? "bg-palm-700 text-white"
                : "bg-white text-mist-700 shadow-card hover:bg-palm-50",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
