"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ActionResult = { ok: boolean; error?: string };

/** Botón de borrado con confirmación (soft delete). */
export function DeleteButton({
  action,
  id,
  name,
  permanent = false,
  label,
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  name: string;
  permanent?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = () => {
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        toast.success(permanent ? "Eliminado definitivamente" : "Movido a la papelera");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo eliminar");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar ${name}`}
        className="pressable flex size-9 items-center justify-center rounded-full text-mist-500 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <Trash size={17} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              <Warning size={22} weight="bold" />
            </span>
            <div>
              <DialogTitle>
                {permanent ? "¿Eliminar definitivamente?" : "¿Mover a la papelera?"}
              </DialogTitle>
              <DialogDescription>
                {permanent
                  ? `"${name}" se eliminará para siempre. Esta acción no se puede deshacer.`
                  : `"${name}" se moverá a la papelera y podrás restaurarlo después.`}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={run} disabled={pending}>
              {pending ? "Eliminando…" : label ?? (permanent ? "Eliminar definitivamente" : "Mover a papelera")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Botón de restaurar desde la papelera. */
export function RestoreButton({
  action,
  id,
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await action(id);
          if (result.ok) {
            toast.success("Restaurado");
            router.refresh();
          } else {
            toast.error(result.error || "No se pudo restaurar");
          }
        })
      }
      className="pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-palm-700/30 bg-white px-4 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50 disabled:opacity-60"
    >
      <ArrowCounterClockwise size={15} /> {pending ? "Restaurando…" : "Restaurar"}
    </button>
  );
}
