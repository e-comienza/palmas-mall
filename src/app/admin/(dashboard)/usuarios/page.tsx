import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { UserForm } from "./user-form";
import { UserListItem } from "./user-list-item";
import { formatDateShortEs } from "@/lib/utils";

export const metadata = { title: "Usuarios" };

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
              <UserListItem
                key={user.id}
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  active: user.active,
                }}
                createdLabel={formatDateShortEs(user.createdAt)}
                isSelf={user.id === currentUser.id}
              />
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
