"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Minus, ArrowCounterClockwise } from "@phosphor-icons/react";

/**
 * Visor del plano con zoom/pan táctil (pinch en móvil, rueda en desktop).
 * Implementado con transform para mantener 60fps.
 */
export function PlanoViewer({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const clampScale = (s: number) => Math.min(4, Math.max(1, s));

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale === 1) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
    },
    [scale, pos],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.baseX + (e.clientX - drag.current.startX),
      y: drag.current.baseY + (e.clientY - drag.current.startY),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const next = clampScale(s - e.deltaY * 0.002);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinch.current = { dist: Math.hypot(dx, dy), scale };
      }
    },
    [scale],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const next = clampScale((Math.hypot(dx, dy) / pinch.current.dist) * pinch.current.scale);
      setScale(next);
      if (next === 1) setPos({ x: 0, y: 0 });
    }
  }, []);

  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-xl bg-mist-100 sm:aspect-[16/9]"
        style={{ touchAction: scale > 1 ? "none" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "default",
          }}
        >
          {/* unoptimized: se sirve el WebP full-res para que el zoom (hasta 4x) no se pixele. */}
          <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" priority unoptimized />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s + 0.5))}
          aria-label="Acercar plano"
          className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card"
        >
          <Plus size={18} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() =>
            setScale((s) => {
              const next = clampScale(s - 0.5);
              if (next === 1) setPos({ x: 0, y: 0 });
              return next;
            })
          }
          aria-label="Alejar plano"
          className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card"
        >
          <Minus size={18} weight="bold" />
        </button>
        {scale > 1 ? (
          <button
            type="button"
            onClick={reset}
            aria-label="Restablecer zoom"
            className="pressable flex size-10 items-center justify-center rounded-full bg-white text-palm-800 shadow-card"
          >
            <ArrowCounterClockwise size={18} weight="bold" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
