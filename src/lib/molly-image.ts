/**
 * Utilidades para la imagen de Molly: acepta imágenes estáticas, GIFs
 * o links de Giphy (página, embed o media) y los normaliza a una URL
 * directa de imagen.
 */

const GIPHY_ID = /giphy\.com\/(?:embed|media|gifs|clips)\/(?:[a-zA-Z0-9-]*-)?([a-zA-Z0-9]{8,})/;

/** Convierte links de Giphy (embed/página) a la URL directa del .gif. */
export function normalizeMollyUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const match = trimmed.match(GIPHY_ID);
  if (match && !/\.(gif|webp|png|jpe?g)(\?|$)/i.test(trimmed)) {
    return `https://media.giphy.com/media/${match[1]}/giphy.gif`;
  }
  return trimmed;
}

/** ¿La imagen es animada (GIF o Giphy)? El GIF ya trae su propio saludo. */
export function isAnimatedImage(url: string): boolean {
  return /\.gif(\?|$)/i.test(url) || /giphy\.com/i.test(url);
}
