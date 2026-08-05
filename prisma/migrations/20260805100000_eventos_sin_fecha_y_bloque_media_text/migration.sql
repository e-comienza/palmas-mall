-- Cambios aditivos (no borran ni sobrescriben contenido existente):
-- 1. Event.startsAt pasa a opcional → soporta anuncios sin fecha y eventos recurrentes.
-- 2. Event.dateLabel: texto libre que reemplaza la fecha ("Todos los sábados", "Permanente").
-- 3. Nuevo BlockType MEDIA_TEXT (imagen + texto + botones) para hacer editables
--    secciones que hoy están hardcodeadas.

ALTER TABLE "Event" ALTER COLUMN "startsAt" DROP NOT NULL;

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "dateLabel" TEXT NOT NULL DEFAULT '';

-- El nuevo valor del enum va solo en esta migración: Postgres no permite usarlo
-- dentro de la misma transacción en la que se agrega (ver migración siguiente).
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'MEDIA_TEXT';
