-- Cambios aditivos (no borran ni sobrescriben contenido existente):
-- 1. Brochure de sponsors: nº de páginas + título e intro editables, para
--    mostrar el PDF hoja por hoja en la página Be Our Sponsors.
-- 2. Copy del bloque "¿Quieres tu marca en Palmas Mall?" editable desde el admin
--    (hoy hardcodeado en Contacto y Plano del mall).
-- 3. Event.order: orden manual de los eventos, reflejado en /eventos.

ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "sponsorPdfPages" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "sponsorPdfHeading" TEXT NOT NULL DEFAULT 'Brochure de sponsors';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "sponsorPdfIntro" TEXT NOT NULL DEFAULT 'Modalidades, medidas y tarifas de publicidad dentro y fuera del mall. Pasa las hojas o descarga el PDF completo.';

ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "rentalCtaTitle" TEXT NOT NULL DEFAULT '¿Quieres tu marca en Palmas Mall?';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "rentalCtaText" TEXT NOT NULL DEFAULT 'Escríbenos por WhatsApp para conocer la disponibilidad de locales y llevar tu negocio al corazón de la Milla de Oro.';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "rentalCtaLabel" TEXT NOT NULL DEFAULT 'Averiguar por un local';

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "Event_order_idx" ON "Event"("order");

-- Semilla del orden manual: respeta el orden que hoy se ve en /eventos
-- (próximos primero por fecha, los sin fecha al final), para que activar el
-- orden manual no reordene nada de golpe.
WITH ranked AS (
  SELECT "id", (ROW_NUMBER() OVER (
    ORDER BY "startsAt" ASC NULLS LAST, "createdAt" DESC
  ))::int - 1 AS pos
  FROM "Event"
  WHERE "deletedAt" IS NULL
)
UPDATE "Event" e SET "order" = ranked.pos
FROM ranked WHERE e."id" = ranked."id" AND e."order" = 0;
