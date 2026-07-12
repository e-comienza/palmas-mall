import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export type SessionUser = { id: string; email: string; name: string; role: Role };

const ROLE_LEVEL: Record<Role, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(user: { role: Role }, minimum: Role): boolean {
  return ROLE_LEVEL[user.role] >= ROLE_LEVEL[minimum];
}

/** Server-component guard: redirects to login when unauthenticated. */
export async function requireUser(minimum: Role = "EDITOR"): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!hasRole(session.user, minimum)) redirect("/admin?error=permisos");
  return session.user;
}

/** Server-action guard: throws instead of redirecting. */
export async function requireActionUser(minimum: Role = "EDITOR"): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  if (!hasRole(session.user, minimum)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
  return session.user;
}

export const can = {
  publish: (u: { role: Role }) => hasRole(u, "ADMIN"),
  delete: (u: { role: Role }) => hasRole(u, "ADMIN"),
  destroy: (u: { role: Role }) => hasRole(u, "SUPER_ADMIN"),
  manageUsers: (u: { role: Role }) => hasRole(u, "SUPER_ADMIN"),
  manageSettings: (u: { role: Role }) => hasRole(u, "SUPER_ADMIN"),
};
