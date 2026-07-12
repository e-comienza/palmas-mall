"use client";

import { useActionState, useState } from "react";
import { CaretUp, CaretDown, Plus, X } from "@phosphor-icons/react";
import { saveMenuItems } from "@/app/admin/_actions/misc";
import {
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Item = { label: string; url: string; visible: boolean };

export function MenuEditor({
  menuId,
  menuName,
  defaultItems,
}: {
  menuId: string;
  menuName: string;
  defaultItems: Item[];
}) {
  const [state, action] = useActionState(saveMenuItems, initialFormState);
  const [items, setItems] = useState<Item[]>(defaultItems);

  const update = (i: number, key: keyof Item, value: string | boolean) => {
    setItems((prev) => prev.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  };

  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <AdminCard title={menuName}>
      <FormStateHandler state={state} />
      <form action={action} className="space-y-3">
        <input type="hidden" name="menuId" value={menuId} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" className="text-mist-400 hover:text-palm-700 disabled:opacity-30">
                <CaretUp size={13} weight="bold" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar" className="text-mist-400 hover:text-palm-700 disabled:opacity-30">
                <CaretDown size={13} weight="bold" />
              </button>
            </div>
            <Input value={item.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Etiqueta" aria-label="Etiqueta" className="h-10 flex-1" />
            <Input value={item.url} onChange={(e) => update(i, "url", e.target.value)} placeholder="/ruta" aria-label="URL" className="h-10 flex-1" />
            <Switch checked={item.visible} onCheckedChange={(v) => update(i, "visible", v)} aria-label="Visible" />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
              aria-label="Quitar ítem"
              className="pressable flex size-9 shrink-0 items-center justify-center rounded-full text-mist-500 hover:bg-red-50 hover:text-red-700"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { label: "", url: "", visible: true }])}
            className="pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-mist-300 px-4 text-sm font-medium text-mist-600 hover:border-palm-500 hover:text-palm-700"
          >
            <Plus size={14} weight="bold" /> Agregar ítem
          </button>
          <SubmitButton className="h-10 px-5">Guardar menú</SubmitButton>
        </div>
      </form>
    </AdminCard>
  );
}
