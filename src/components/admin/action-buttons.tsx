"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, ArrowCounterClockwise, Warning, CaretUp, CaretDown } from "@phosphor-icons/react";
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

/**
 * Subir / bajar un elemento en una lista ordenada a mano. Guarda al instante:
 * el orden que se ve en el admin es el que queda publicado.
 */
export function MoveButtons({
  action,
  id,
  name,
  isFirst,
  isLast,
  orientation = "vertical",
}: {
  action: (id: string, dir: -1 | 1) => Promise<ActionResult>;
  id: string;
  name: string;
  isFirst: boolean;
  isLast: boolean;
  orientation?: "vertical" | "horizontal";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const move = (dir: -1 | 1) =>
    startTransition(async () => {
      const result = await action(id, dir);
      if (result.ok) router.refresh();
      else toast.error(result.error || "No se pudo cambiar el orden");
    });

  const cls =
    "pressable flex size-6 items-center justify-center rounded text-mist-400 transition-colors hover:bg-palm-50 hover:text-palm-700 disabled:opacity-25 disabled:hover:bg-transparent";

  return (
    <div className={orientation === "vertical" ? "flex flex-col" : "flex items-center gap-0.5"}>
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={pending || isFirst}
        aria-label={orientation === "horizontal" ? `Mover ${name} antes` : `Subir ${name}`}
        className={cls}
      >
        <CaretUp size={13} weight="bold" className={orientation === "horizontal" ? "-rotate-90" : ""} />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={pending || isLast}
        aria-label={orientation === "horizontal" ? `Mover ${name} después` : `Bajar ${name}`}
        className={cls}
      >
        <CaretDown size={13} weight="bold" className={orientation === "horizontal" ? "-rotate-90" : ""} />
      </button>
    </div>
  );
}
