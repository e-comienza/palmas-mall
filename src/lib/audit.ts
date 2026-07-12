import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/permissions";

type AuditInput = {
  action: "create" | "update" | "delete" | "restore" | "destroy" | "publish" | "login";
  entity: string;
  entityId?: string;
  entityName?: string;
  changes?: Record<string, unknown>;
};

export async function logAudit(user: SessionUser | null, input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? "",
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? "",
        entityName: input.entityName ?? "",
        changes: (input.changes ?? {}) as object,
      },
    });
  } catch (error) {
    // La auditoría nunca debe romper la operación principal
    console.error("[audit] failed to write audit log", error);
  }
}
