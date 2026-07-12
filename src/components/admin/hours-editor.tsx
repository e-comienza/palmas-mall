"use client";

import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

type HoursEntry = { days: string; hours: string };

/** Editor de horarios estructurados: filas de {días, horario} → JSON hidden. */
export function HoursEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: HoursEntry[];
}) {
  const [rows, setRows] = useState<HoursEntry[]>(
    defaultValue.length ? defaultValue : [],
  );

  const update = (i: number, key: keyof HoursEntry, value: string) => {
    setRows((prev) => prev.map((row, j) => (j === i ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rows.filter((r) => r.days.trim() && r.hours.trim()))}
      />
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.days}
            onChange={(e) => update(i, "days", e.target.value)}
            placeholder="Lunes a viernes"
            aria-label="Días"
            className="flex-1"
          />
          <Input
            value={row.hours}
            onChange={(e) => update(i, "hours", e.target.value)}
            placeholder="10:00 a.m. – 8:00 p.m."
            aria-label="Horario"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
            aria-label="Quitar fila"
            className="pressable flex size-9 shrink-0 items-center justify-center rounded-full text-mist-500 hover:bg-red-50 hover:text-red-700"
          >
            <X size={15} weight="bold" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { days: "", hours: "" }])}
        className="pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-mist-300 px-4 text-sm font-medium text-mist-600 transition-colors hover:border-palm-500 hover:text-palm-700"
      >
        <Plus size={14} weight="bold" /> Agregar horario
      </button>
    </div>
  );
}
