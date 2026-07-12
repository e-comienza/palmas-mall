import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { breadcrumbJsonLd, JsonLdScript } from "@/lib/jsonld";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Inicio", path: "/" }, ...items];
  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd(all)} />
      <nav aria-label="Miga de pan" className="overflow-x-auto">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-mist-500">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {i > 0 && <CaretRight size={12} className="text-mist-400" />}
                {last ? (
                  <span aria-current="page" className="font-medium text-mist-700">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="transition-colors hover:text-palm-700">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
