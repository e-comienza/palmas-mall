"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Minus, ArrowsOut, ArrowCounterClockwise } from "@phosphor-icons/react";

const MIN = 1;
const MAX = 4;

/**
 * Visor del plano con zoom y pan intuitivos:
 * - Rueda / pellizco: zoom hacia el cursor o el punto medio de los dedos.
 * - Doble clic / doble tap: acerca; otra vez, restablece.
 * - Arrastrar: mueve cuando hay zoom (con límites para no perder el plano).
 * Refs espejo del estado evitan closures obsoletos en los handlers.
 */
export function PlanoViewer({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; bx: number; by: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const apply = useCallback((s: number, x: number, y: number) => {
    scaleRef.current = s;
    posRef.current = { x, y };
    setScale(s);
    setPos({ x, y });
  }, []);

  const clampScale = (s: number) => Math.min(MAX, Math.max(MIN, s));

  const clampPan = useCallback((x: number, y: number, s: number) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const bx = ((s - 1) * el.clientWidth) / 2;
    const by = ((s - 1) * el.clientHeight) / 2;
    return { x: Math.max(-bx, Math.min(bx, x)), y: Math.max(-by, Math.min(by, y)) };
  }, []);

  // Zoom manteniendo fijo el punto (cx,cy) de la pantalla.
  const zoomAt = useCallback(
    (cx: number, cy: number, target: number) => {
      const el = containerRef.current;
      if (!el) return;
      const s1 = clampScale(target);
      if (s1 === 1) return apply(1, 0, 0);
      const rect = el.getBoundingClientRect();
      const u = cx - rect.left - rect.width / 2;
      const v = cy - rect.top - rect.height / 2;
      const s0 = scaleRef.current;
      const nx = u - (s1 / s0) * (u - posRef.current.x);
      const ny = v - (s1 / s0) * (v - posRef.current.y);
      const c = clampPan(nx, ny, s1);
      apply(s1, c.x, c.y);
    },
    [apply, clampPan],
  );

  const zoomCenter = useCallback(
    (target: number) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, target);
    },
    [zoomAt],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomAt(e.clientX, e.clientY, scaleRef.current * factor);
    },
    [zoomAt],
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (scaleRef.current > 1) apply(1, 0, 0);
      else zoomAt(e.clientX, e.clientY, 2.5);
    },
    [apply, zoomAt],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (scaleRef.current <= 1 || e.pointerType === "touch") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, bx: posRef.current.x, by: posRef.current.y };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const c = clampPan(
        drag.current.bx + (e.clientX - drag.current.sx),
        drag.current.by + (e.clientY - drag.current.sy),
        scaleRef.current,
      );
      apply(scaleRef.current, c.x, c.y);
    },
    [apply, clampPan],
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  // Touch: pan a un dedo (con zoom) y pinch a dos dedos hacia el punto medio.
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinch.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), scale: scaleRef.current };
      drag.current = null;
    } else if (e.touches.length === 1 && scaleRef.current > 1) {
      drag.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, bx: posRef.current.x, by: posRef.current.y };
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const mx = (a.clientX + b.clientX) / 2;
        const my = (a.clientY + b.clientY) / 2;
        zoomAt(mx, my, (dist / pinch.current.dist) * pinch.current.scale);
      } else if (e.touches.length === 1 && drag.current) {
        const c = clampPan(
          drag.current.bx + (e.touches[0].clientX - drag.current.sx),
          drag.current.by + (e.touches[0].clientY - drag.current.sy),
          scaleRef.current,
        );
        apply(scaleRef.current, c.x, c.y);
      }
    },
    [apply, clampPan, zoomAt],
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) pinch.current = null;
    if (e.touches.length === 0) drag.current = null;
  }, []);

  const zoomed = scale > 1;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist-100 select-none sm:aspect-[16/9]"
        style={{ touchAction: zoomed ? "none" : "pan-y", cursor: zoomed ? (drag.current ? "grabbing" : "grab") : "zoom-in" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="absolute inset-0 origin-center will-change-transform"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: drag.current || pinch.current ? "none" : "transform 0.18s ease-out",
          }}
        >
          <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" priority unoptimized />
        </div>

        {/* Hint, solo cuando no hay zoom */}
        {!zoomed ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-palm-950/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
              Doble clic para acercar · arrastra para mover · pellizca o rueda para zoom
            </span>
          </div>
        ) : null}
      </div>

      {/* Controles */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomCenter(scaleRef.current + 0.6)}
          aria-label="Acercar plano"
          className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50"
        >
          <Plus size={18} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => zoomCenter(scaleRef.current - 0.6)}
          aria-label="Alejar plano"
          className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50"
        >
          <Minus size={18} weight="bold" />
        </button>
        {zoomed ? (
          <button
            type="button"
            onClick={() => apply(1, 0, 0)}
            aria-label="Restablecer plano"
            className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50"
          >
            <ArrowCounterClockwise size={18} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => zoomCenter(2)}
            aria-label="Acercar al centro"
            className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card hover:bg-palm-50"
          >
            <ArrowsOut size={18} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
