import { Fragment, type ReactNode } from 'react';
import { Heart } from '@phosphor-icons/react/dist/ssr';

/**
 * Reemplaza la palabra "corazón" por un ícono de corazón al renderizar
 * (ej. "en el ❤ de la Milla de Oro"). El texto original conserva la palabra
 * en la base de datos y el ícono lleva aria-label "corazón" para accesibilidad
 * y SEO. Solo para superficies visuales; no usar en FAQ/JSON-LD/legal.
 */
export function withHeart(text: string): ReactNode {
  if (!text || !/coraz[oó]n/i.test(text)) return text;
  const parts = text.split(/coraz[oó]n/i);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? (
        <Heart
          weight="fill"
          aria-label="corazón"
          className="mx-[0.08em] inline-block size-[0.92em] -translate-y-[0.06em] align-baseline text-red-700"
        />
      ) : null}
      {part}
    </Fragment>
  ));
}
