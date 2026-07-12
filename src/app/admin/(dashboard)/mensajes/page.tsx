import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/action-buttons";
import { softDelete } from "@/app/admin/_actions/helpers";
import { markMessageRead } from "@/app/admin/_actions/misc";
import { Badge } from "@/components/ui/badge";
import { formatDateShortEs } from "@/lib/utils";
import { MarkReadButton } from "./mark-read-button";

export const metadata = { title: "Mensajes" };

const KIND_LABEL: Record<string, string> = {
  queja: "Queja",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
  comercial: "Comercial",
};

export default async function AdminMensajesPage() {
  await requireUser("EDITOR");
  const messages = await prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const deleteMessage = softDelete.bind(null, "contactMessage");

  return (
    <div>
      <AdminPageHeader
        title="Mensajes de contacto"
        description="Peticiones, quejas, reclamos y sugerencias enviadas desde el sitio."
      />
      {messages.length ? (
        <div className="space-y-3">
          {messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl bg-white p-5 shadow-card ${!m.read ? "ring-2 ring-leaf-500/40" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-palm-950">
                    {m.name} {m.lastName}
                    {!m.read ? <Badge variant="leaf" className="ml-2">Nuevo</Badge> : null}
                  </p>
                  <p className="mt-0.5 text-[13px] text-mist-500">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                    {m.city ? ` · ${m.city}` : ""} · {formatDateShortEs(m.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{KIND_LABEL[m.kind] ?? m.kind}</Badge>
                  {m.subject ? <Badge variant="muted">{m.subject}</Badge> : null}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mist-700">
                {m.message}
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                {!m.read ? <MarkReadButton action={markMessageRead} id={m.id} /> : null}
                <a
                  href={`mailto:${m.email}`}
                  className="pressable inline-flex h-9 items-center rounded-full border border-palm-700/30 bg-white px-4 text-sm font-semibold text-palm-800 hover:bg-palm-50"
                >
                  Responder por email
                </a>
                <DeleteButton action={deleteMessage} id={m.id} name={`mensaje de ${m.name}`} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay mensajes"
          hint="Cuando alguien escriba desde el formulario de contacto aparecerá aquí."
        />
      )}
    </div>
  );
}
