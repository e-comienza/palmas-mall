import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { withHeart } from "@/lib/heart-text";
import { cn } from "@/lib/utils";

/**
 * Bloque "¿Quieres tu marca en Palmas Mall?" (Contacto y Plano del mall).
 * El copy vive en Configuración del admin; el mensaje de WhatsApp lo pone
 * cada página, porque cambia según desde dónde escriba la persona.
 */
export function RentalCta({
  title,
  text,
  label,
  whatsapp,
  message,
  className,
}: {
  title: string;
  text: string;
  label: string;
  whatsapp: string;
  message: string;
  className?: string;
}) {
  if (!title && !text) return null;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-palm-950 px-6 py-8 text-white sm:px-10 sm:py-10",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          {title ? (
            <h2 className="font-display text-xl font-bold tracking-[-0.01em] sm:text-2xl">
              {title}
            </h2>
          ) : null}
          {text ? (
            <p className="mt-2 text-[15px] leading-relaxed text-mist-200">{withHeart(text)}</p>
          ) : null}
        </div>
        {label ? (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-white px-7 text-sm font-semibold text-palm-900 transition-colors hover:bg-mist-100 sm:self-auto"
          >
            <WhatsappLogo size={20} weight="fill" /> {label}
          </a>
        ) : null}
      </div>
    </div>
  );
}
