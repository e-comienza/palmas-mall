import Link from "next/link";
import Image from "next/image";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireUser, can } from "@/lib/permissions";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/admin/search-input";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Eventos" };

export default async function AdminEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser("EDITOR");
  const { q } = await searchParams;
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { startsAt: "desc" },
  });

  const deleteEvent = softDelete.bind(null, "event");

  return (
    <div>
      <AdminPageHeader
        title="Eventos"
        description="Agenda de eventos y experiencias del mall."
        createHref="/admin/eventos/nuevo"
        createLabel="Nuevo evento"
      >
        <SearchInput placeholder="Buscar evento…" />
      </AdminPageHeader>

      {events.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="px-5 py-3 font-semibold">Evento</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Vigencia</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {events.map((event) => {
                  const finished = (event.endsAt ?? event.startsAt) < now;
                  return (
                    <tr key={event.id} className="transition-colors hover:bg-mist-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-mist-100">
                            {event.coverUrl ? (
                              <Image src={event.coverUrl} alt="" fill sizes="40px" className="object-cover" unoptimized={event.coverUrl.startsWith("/uploads")} />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-semibold text-palm-950">{event.title}</p>
                            <p className="text-[12px] text-mist-500">
                              {event.location || "-"}
                              {event.featured ? " · destacado" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-mist-700">{formatDateShortEs(event.startsAt)}</td>
                      <td className="px-5 py-3"><StatusBadge status={event.status} /></td>
                      <td className="px-5 py-3">
                        {finished ? <Badge variant="muted">Finalizado</Badge> : <Badge variant="leaf">Vigente</Badge>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/eventos/${event.id}`}
                            aria-label={`Editar ${event.title}`}
                            className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 hover:bg-palm-50 hover:text-palm-800"
                          >
                            <PencilSimple size={17} />
                          </Link>
                          {can.delete(user) ? (
                            <DeleteButton action={deleteEvent} id={event.id} name={event.title} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={q ? "Sin resultados" : "Aún no hay eventos"}
          hint={q ? `No encontramos eventos con “${q}”.` : "Crea el primer evento de la agenda."}
          createHref={q ? undefined : "/admin/eventos/nuevo"}
        />
      )}
    </div>
  );
}
