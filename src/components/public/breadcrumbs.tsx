import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { breadcrumbJsonLd, JsonLdScript } from "@/lib/jsonld";

export function Breadcrumbs({
  items,
  tone = "dark",
}: {
  items: { name: string; path: string }[];
  /** "light" para cabeceras con foto de fondo. */
  tone?: "dark" | "light";
}) {
  const all = [{ name: "Inicio", path: "/" }, ...items];
  const light = tone === "light";
  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd(all)} />
      <nav aria-label="Miga de pan" className="overflow-x-auto">
        <ol
          className={`flex items-center gap-1.5 whitespace-nowrap text-[13px] ${
            light ? "text-white/70" : "text-mist-500"
          }`}
        >
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {i > 0 && <CaretRight size={12} className={light ? "text-white/50" : "text-mist-400"} />}
                {last ? (
                  <span
                    aria-current="page"
                    className={`font-medium ${light ? "text-white" : "text-mist-700"}`}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className={`transition-colors ${light ? "hover:text-white" : "hover:text-palm-700"}`}
                  >
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
