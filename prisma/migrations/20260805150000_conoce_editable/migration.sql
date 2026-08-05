-- Data migration: convierte el contenido hardcodeado de "Conoce Palmas Mall" en
-- bloques editables desde el admin, con el mismo contenido que se ve hoy.
--   · MEDIA_TEXT     → historia/concepto (texto + collage de 2 fotos + enlace)
--   · SERVICE_CARDS  → las 6 experiencias con icono
--   · GALLERY        → "Así se vive Palmas Mall" + enlace a Momentos Palmas Mall
-- La galería queda sin imágenes propias a propósito: así sigue mostrando la
-- galería del home hasta que alguien cargue fotos específicas desde el admin.
-- Idempotente y no destructivo: solo inserta si la página existe y el bloque falta.

-- 1) Historia / concepto
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'MEDIA_TEXT'::"BlockType",
  COALESCE((SELECT MAX(b."order") + 1 FROM "PageBlock" b WHERE b."pageId" = p."id"), 0),
  '{
    "heading": "El Lifestyle Mall que cambió la forma de vivir la ciudad",
    "body": "<p>Palmas Mall® trajo a Colombia el concepto de arquitectura comercial conocido como <strong>Lifestyle Mall</strong>: un centro comercial que se implanta cerca de las mejores zonas residenciales de la ciudad para atender y sorprender a sus exigentes residentes.</p><p>Representa un estilo de vida: te sorprende con su hermosa arquitectura y te atrapa con una filosofía construida en torno a las experiencias. Todo, para que disfrutes lo que promete nuestro slogan: <em>tus mejores momentos</em>.</p>",
    "imageUrl": "/images/galeria/shopping-cali2.webp",
    "imageAlt": "Arquitectura a cielo abierto de Palmas Mall",
    "imageUrl2": "/images/galeria/20250119_193238112_ios-scaled.webp",
    "imageAlt2": "Atardecer en Palmas Mall",
    "imagePosition": "right",
    "buttons": [
      { "label": "Un diseño premiado internacionalmente", "url": "/galardones", "variant": "link" }
    ]
  }'::jsonb,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p."slug" = 'conoce-palmas-mall'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b WHERE b."pageId" = p."id" AND b."type" = 'MEDIA_TEXT'
  );

-- 2) Experiencias
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'SERVICE_CARDS'::"BlockType",
  COALESCE((SELECT MAX(b."order") + 1 FROM "PageBlock" b WHERE b."pageId" = p."id"), 0),
  '{
    "heading": "Un mall diseñado alrededor de experiencias",
    "intro": "Seis razones por las que Palmas Mall es mucho más que un centro comercial.",
    "items": [
      { "icon": "food", "title": "Food Hall único en el país", "text": "Distintas plazas gastronómicas se articulan con restaurantes seleccionados y servicio a la mesa, ideales para el slow food." },
      { "icon": "store", "title": "Moda y marcas con historia", "text": "Boutiques exclusivas y concept stores donde cada elección cuenta una historia personal." },
      { "icon": "tree", "title": "Arquitectura a cielo abierto", "text": "Espacios envueltos en vegetación tropical, diseñados para quedarse: terrazas, jardines y plazoletas." },
      { "icon": "pet", "title": "Petfriendly de verdad", "text": "Tu mascota es bienvenida en los corredores, jardines y terrazas del mall." },
      { "icon": "laptop", "title": "Coworking con aire libre", "text": "Zonas para trabajar o reunirte rodeado de verde, con la mejor oferta de café cerca." },
      { "icon": "users", "title": "Planes para toda la familia", "text": "PlayZone para los niños, eventos cada semana y espacios pensados para compartir." }
    ]
  }'::jsonb,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p."slug" = 'conoce-palmas-mall'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b WHERE b."pageId" = p."id" AND b."type" = 'SERVICE_CARDS'
  );

-- 3) Galería + enlace a Momentos Palmas Mall
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'GALLERY'::"BlockType",
  COALESCE((SELECT MAX(b."order") + 1 FROM "PageBlock" b WHERE b."pageId" = p."id"), 0),
  '{
    "heading": "Así se vive Palmas Mall",
    "intro": "Arquitectura, gastronomía, moda y momentos en familia. Toca cualquier foto para verla en grande.",
    "urls": [],
    "ctaLabel": "Ver todos los momentos",
    "ctaUrl": "/momentos-palmas-mall"
  }'::jsonb,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p."slug" = 'conoce-palmas-mall'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b WHERE b."pageId" = p."id" AND b."type" = 'GALLERY'
  );
