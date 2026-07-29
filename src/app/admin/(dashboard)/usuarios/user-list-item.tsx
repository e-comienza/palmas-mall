"use client";

import { useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/action-buttons";
import { deleteUser } from "@/app/admin/_actions/misc";
import { UserForm, type EditableUser } from "./user-form";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export function UserListItem({
  user,
  createdLabel,
  isSelf,
}: {
  user: EditableUser;
  createdLabel: string;
  isSelf: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-palm-950">
            {user.name}
            {isSelf ? <span className="ml-2 text-[12px] font-normal text-mist-500">(tú)</span> : null}
          </p>
          <p className="text-[13px] text-mist-500">
            {user.email} · desde {createdLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.role === "SUPER_ADMIN" ? "dark" : user.role === "ADMIN" ? "default" : "outline"}>
            {ROLE_LABEL[user.role]}
          </Badge>
          {!user.active ? <Badge variant="muted">Inactivo</Badge> : null}
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label={`Editar ${user.email}`}
            aria-pressed={editing}
            className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 transition-colors hover:bg-palm-50 hover:text-palm-800"
          >
            <PencilSimple size={17} />
          </button>
          {!isSelf ? <DeleteButton action={deleteUser} id={user.id} name={user.email} permanent /> : null}
        </div>
      </div>
      {editing ? (
        <div className="mt-4 rounded-2xl bg-mist-50 p-4">
          <UserForm user={user} onDone={() => setEditing(false)} />
        </div>
      ) : null}
    </li>
  );
}
