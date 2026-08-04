-- Data migration (idempotente):
-- 1. Oculta la burbuja flotante de WhatsApp (re-activable desde Admin → Configuración).
-- 2. Unifica "Moda" + "Deporte" en "Moda & Deporte".
-- 3. Renombra "Hamburguesas & Familiar" a "Familiar".
-- 4. Elimina "Salud & Belleza" y "Entretenimiento" (los locales quedan sin
--    categoría gracias al FK ON DELETE SET NULL).

-- 1) Burbuja de WhatsApp off
UPDATE "SiteSettings" SET "whatsappBubbleEnabled" = false WHERE "id" = 1;

-- 2) Moda + Deporte → Moda & Deporte
--    Si existen ambas: mover locales de deporte a moda y borrar deporte.
UPDATE "Local"
SET "categoryId" = (SELECT "id" FROM "LocalCategory" WHERE "slug" = 'moda')
WHERE "categoryId" = (SELECT "id" FROM "LocalCategory" WHERE "slug" = 'deporte')
  AND EXISTS (SELECT 1 FROM "LocalCategory" WHERE "slug" = 'moda');

DELETE FROM "LocalCategory"
WHERE "slug" = 'deporte'
  AND EXISTS (SELECT 1 FROM "LocalCategory" WHERE "slug" = 'moda');

--    Renombrar la que quede (moda, o deporte si moda no existía).
UPDATE "LocalCategory"
SET "slug" = 'moda-deporte', "name" = 'Moda & Deporte'
WHERE "slug" IN ('moda', 'deporte');

-- 3) Hamburguesas & Familiar → Familiar
UPDATE "LocalCategory"
SET "slug" = 'familiar', "name" = 'Familiar'
WHERE "slug" = 'hamburguesas-familiar';

-- 4) Eliminar Salud & Belleza y Entretenimiento
DELETE FROM "LocalCategory" WHERE "slug" IN ('salud-belleza', 'entretenimiento');
