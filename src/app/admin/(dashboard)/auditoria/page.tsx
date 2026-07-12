import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, AdminCard, EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Auditoría" };

const ACTION_LABEL: Record<string, { label: string; variant: "default" | "warning" | "danger" | "muted" | "leaf" }> = {
  create: { label: "Creación", variant: "leaf" },
  update: { label: "Edición", variant: "default" },
  delete: { label: "A papelera", variant: "warning" },
  restore: { label: "Restauración", variant: "default" },
  destroy: { label: "Eliminación", variant: "danger" },
  publish: { label: "Publicación", variant: "leaf" },
  login: { label: "Inicio de sesión", variant: "muted" },
};

export default async function AdminAuditoriaPage() {
  await requireUser("ADMIN");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <AdminPageHeader
        title="Auditoría"
        description="Historial de cambios: quién creó, editó o eliminó contenido y cuándo."
      />
      {logs.length ? (
        <AdminCard className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-mist-200 text-left text-[12px] uppercase tracking-wide text-mist-500">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Acción</th>
                  <th className="px-5 py-3 font-semibold">Contenido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {logs.map((log) => {
                  const action = ACTION_LABEL[log.action] ?? { label: log.action, variant: "muted" as const };
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-mist-50">
                      <td className="whitespace-nowrap px-5 py-3 text-mist-600">
                        {log.createdAt.toLocaleString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-mist-700">{log.userEmail || "sistema"}</td>
                      <td className="px-5 py-3">
                        <Badge variant={action.variant}>{action.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-mist-700">
                        <span className="font-semibold text-palm-950">{log.entity}</span>
                        {log.entityName ? ` · ${log.entityName}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ) : (
        <EmptyState title="Sin actividad registrada" />
      )}
    </div>
  );
}
