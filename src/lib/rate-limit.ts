import { headers } from "next/headers";

/**
 * Limitador de intentos en memoria (ventana fija).
 *
 * Limitación conocida: el contador vive en el proceso. Con varios procesos o
 * instancias (Passenger en cPanel puede levantar más de uno) cada uno lleva su
 * propia cuenta, así que el límite efectivo se multiplica por el nº de procesos.
 * Aun así corta la fuerza bruta y el spam automatizado, que es el caso real.
 * Para un límite exacto habría que moverlo a la base de datos o a Redis.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Salvaguarda contra un ataque que genere claves distintas sin parar.
  if (buckets.size > MAX_BUCKETS) buckets.clear();
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 512) prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * IP del cliente detrás del proxy (Railway, LiteSpeed/Passenger en cPanel).
 * Devuelve "unknown" si no hay cabecera: entonces todos los anónimos comparten
 * cubo, que es conservador pero nunca deja pasar de más.
 */
export async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
  } catch {
    return "unknown";
  }
}
