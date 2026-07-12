"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "@phosphor-icons/react";

export function MarkReadButton({
  action,
  id,
}: {
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
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
          if (result.ok) router.refresh();
          else toast.error(result.error || "Error");
        })
      }
      className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-palm-700 px-4 text-sm font-semibold text-white hover:bg-palm-800 disabled:opacity-60"
    >
      <Check size={14} weight="bold" /> Marcar leído
    </button>
  );
}
