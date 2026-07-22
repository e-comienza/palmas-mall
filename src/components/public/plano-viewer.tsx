"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Minus, ArrowsOut, ArrowCounterClockwise } from "@phosphor-icons/react";

const MIN = 1;
const MAX = 4;

/**
 * Visor del plano con drag simple y confiable (Pointer Events unificados):
 * - Arrastrar con 1 dedo/mouse mueve el plano cuando hay zoom (pan incremental
 *   por delta, sin saltos).
 * - Pellizco con 2 dedos hace zoom hacia el punto medio.
 * - Rueda hace zoom hacia el cursor; doble clic acerca/restablece.
 */
export function PlanoViewer({ src, alt }: { src: string; alt: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState(false);

  const sRef = useRef(1);
  const pRef = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const apply = useCallback((s: number, x: number, y: number) => {
    sRef.current = s;
    pRef.current = { x, y };
    setScale(s);
    setPos({ x, y });
  }, []);

  const clampScale = (s: number) => Math.min(MAX, Math.max(MIN, s));

  const clampPan = useCallback((x: number, y: number, s: number) => {
    const el = boxRef.current;
    if (!el) return { x, y };
    const bx = ((s - 1) * el.clientWidth) / 2;
    const by = ((s - 1) * el.clientHeight) / 2;
    return { x: Math.max(-bx, Math.min(bx, x)), y: Math.max(-by, Math.min(by, y)) };
  }, []);

  const zoomAt = useCallback(
    (cx: number, cy: number, target: number) => {
      const el = boxRef.current;
      if (!el) return;
      const s1 = clampScale(target);
      if (s1 === 1) return apply(1, 0, 0);
      const rect = el.getBoundingClientRect();
      const u = cx - rect.left - rect.width / 2;
      const v = cy - rect.top - rect.height / 2;
      const s0 = sRef.current;
      const nx = u - (s1 / s0) * (u - pRef.current.x);
      const ny = v - (s1 / s0) * (v - pRef.current.y);
      const c = clampPan(nx, ny, s1);
      apply(s1, c.x, c.y);
    },
    [apply, clampPan],
  );

  const flashSmooth = () => {
    setSmooth(true);
    window.setTimeout(() => setSmooth(false), 200);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = boxRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: sRef.current };
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2 && pinch.current) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.current.scale * (dist / pinch.current.dist));
        return;
      }
      // Pan incremental (solo con zoom)
      if (sRef.current <= 1) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      const c = clampPan(pRef.current.x + dx, pRef.current.y + dy, sRef.current);
      apply(sRef.current, c.x, c.y);
    },
    [apply, clampPan, zoomAt],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, sRef.current * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    },
    [zoomAt],
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      flashSmooth();
      if (sRef.current > 1) apply(1, 0, 0);
      else zoomAt(e.clientX, e.clientY, 2.5);
    },
    [apply, zoomAt],
  );

  const zoomButton = useCallback(
    (target: number) => {
      const el = boxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      flashSmooth();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, target);
    },
    [zoomAt],
  );

  const zoomed = scale > 1;

  return (
    <div className="relative">
      <div
        ref={boxRef}
        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist-100 select-none sm:aspect-[16/9]"
        style={{ touchAction: zoomed ? "none" : "pan-y", cursor: zoomed ? "grab" : "zoom-in" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="absolute inset-0 origin-center will-change-transform"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: smooth ? "transform 0.2s ease-out" : "none",
          }}
        >
          <Image src={src} alt={alt} fill sizes="100vw" className="pointer-events-none object-contain" priority unoptimized />
        </div>

        {!zoomed ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-palm-950/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
              Doble clic para acercar · arrastra para mover · pellizca o rueda para zoom
            </span>
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button type="button" onClick={() => zoomButton(sRef.current + 0.6)} aria-label="Acercar plano" className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50">
          <Plus size={18} weight="bold" />
        </button>
        <button type="button" onClick={() => zoomButton(sRef.current - 0.6)} aria-label="Alejar plano" className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50">
          <Minus size={18} weight="bold" />
        </button>
        {zoomed ? (
          <button type="button" onClick={() => { flashSmooth(); apply(1, 0, 0); }} aria-label="Restablecer plano" className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50">
            <ArrowCounterClockwise size={18} weight="bold" />
          </button>
        ) : (
          <button type="button" onClick={() => zoomButton(2)} aria-label="Acercar al centro" className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50">
            <ArrowsOut size={18} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
