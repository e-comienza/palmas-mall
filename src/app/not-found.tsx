import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-mist-50 px-6 text-center">
      <Image
        src="/brand/palmas-mall.png"
        alt="Palmas Mall"
        width={180}
        height={113}
        className="h-24 w-auto"
      />
      <p className="mt-10 font-display text-7xl font-bold tracking-[-0.02em] text-palm-200 sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
        Esta página se fue de paseo
      </h1>
      <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-mist-600">
        No encontramos lo que buscabas, pero en Palmas Mall siempre hay algo
        bueno esperándote.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="pressable inline-flex h-12 items-center rounded-full bg-palm-700 px-7 text-base font-semibold text-white transition-colors hover:bg-palm-800"
        >
          Volver al inicio
        </Link>
        <Link
          href="/locales"
          className="pressable inline-flex h-12 items-center rounded-full border border-palm-700/30 bg-white px-7 text-base font-semibold text-palm-800 transition-colors hover:bg-palm-50"
        >
          Explorar locales
        </Link>
      </div>
    </div>
  );
}
