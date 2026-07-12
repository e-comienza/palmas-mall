"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectTo?: string;
};

export const initialFormState: FormState = { ok: false };

/** Muestra toasts y redirige según el resultado del server action. */
export function FormStateHandler({ state }: { state: FormState }) {
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      toast.success("Guardado correctamente");
      if (state.redirectTo) router.push(state.redirectTo);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return null;
}

export function SubmitButton({
  children = "Guardar",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "pressable inline-flex h-11 items-center justify-center rounded-full bg-palm-700 px-7 text-sm font-semibold text-white transition-colors hover:bg-palm-800 disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-[12px] text-mist-500">{hint}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
