import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { deleteUser } from "@/app/admin/_actions/misc";
import { DeleteButton } from "@/components/admin/action-buttons";
import { UserForm } from "./user-form";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Usuarios" };

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export default async function AdminUsuariosPage() {
  const currentUser = await requireUser("SUPER_ADMIN");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Usuarios del admin"
        description="Super Admin: todo. Admin: gestiona contenido. Editor: crea borradores, no publica ni elimina."
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard title={`Equipo (${users.length})`} className="!p-0">
          <ul className="divide-y divide-mist-100">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-palm-950">
                    {user.name}
                    {user.id === currentUser.id ? (
                      <span className="ml-2 text-[12px] font-normal text-mist-500">(tú)</span>
                    ) : null}
                  </p>
                  <p className="text-[13px] text-mist-500">
                    {user.email} · desde {formatDateShortEs(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "SUPER_ADMIN" ? "dark" : user.role === "ADMIN" ? "default" : "outline"}>
                    {ROLE_LABEL[user.role]}
                  </Badge>
                  {!user.active ? <Badge variant="muted">Inactivo</Badge> : null}
                  {user.id !== currentUser.id ? (
                    <DeleteButton action={deleteUser} id={user.id} name={user.email} permanent />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Crear usuario">
          <UserForm />
        </AdminCard>
      </div>
    </div>
  );
}
