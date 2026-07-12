import Link from "next/link";
import type { Local } from "@prisma/client";
import { Clock, MapPin, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { asHours } from "@/lib/utils";

/**
 * Datos prácticos del local: horario y ubicación dentro del mall.
 * Pensado como sidebar en desktop y bloque apilado en móvil.
 */
export function LocalDetails({
  local,
  mallAddress,
}: {
  local: Local;
  mallAddress: string;
}) {
  const hours = asHours(local.openingHours);

  return (
    <div className="space-y-5">
      {hours.length ? (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-palm-950">
            <Clock size={20} className="text-palm-700" weight="bold" /> Horario
          </h2>
          <dl className="mt-4 space-y-3">
            {hours.map((h) => (
              <div key={h.days} className="text-sm">
                <dt className="font-semibold text-mist-800">{h.days}</dt>
                <dd className="text-mist-600">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-palm-950">
          <MapPin size={20} className="text-palm-700" weight="bold" /> Dentro del mall
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mist-600">
          {local.floor ? `${local.floor} · ` : ""}
          {local.unitNumber ? `Local ${local.unitNumber} · ${mallAddress}` : mallAddress}
        </p>
        <Link
          href="/plano-del-mall"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-palm-700 transition-colors hover:text-palm-900"
        >
          Ver plano del mall <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
