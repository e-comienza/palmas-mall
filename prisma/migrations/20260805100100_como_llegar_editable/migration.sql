-- Data migration: convierte el contenido hardcodeado de "Cómo llegar" en bloques
-- editables desde el admin, con exactamente el mismo contenido que se ve hoy.
--   · MEDIA_TEXT     → foto de la fachada + datos de la sede + botones de mapas
--   · SERVICE_CARDS  → las 4 cards de medios de transporte
-- Idempotente: no hace nada si la página no existe o si el bloque ya está creado.
-- No modifica ni borra bloques existentes.

-- 1) Sede + fachada
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'MEDIA_TEXT'::"BlockType",
  COALESCE((SELECT MAX(b."order") + 1 FROM "PageBlock" b WHERE b."pageId" = p."id"), 0),
  jsonb_build_object(
    'heading', s."name",
    'body', '<p>' || s."address" || '</p>' ||
            CASE WHEN s."openingHours" <> '' THEN '<p>' || s."openingHours" || '</p>' ELSE '' END,
    'imageUrl', '/images/fachada-palmas.webp',
    'imageAlt', 'Fachada de Palmas Mall sobre la Carrera 105 en Ciudad Jardín, Cali',
    'imagePosition', 'left',
    'buttons', COALESCE((
      SELECT jsonb_agg(btn) FROM (
        SELECT jsonb_build_object('label', 'Abrir en Waze', 'url', s."wazeUrl", 'variant', 'primary') AS btn
        WHERE s."wazeUrl" <> ''
        UNION ALL
        SELECT jsonb_build_object('label', 'Google Maps', 'url', s."mapsUrl", 'variant', 'secondary')
        WHERE s."mapsUrl" <> ''
        UNION ALL
        SELECT jsonb_build_object('label', 'WhatsApp', 'url', 'https://wa.me/' || s."whatsapp", 'variant', 'secondary')
        WHERE s."whatsapp" <> ''
      ) t
    ), '[]'::jsonb)
  ),
  true,
  NOW(),
  NOW()
FROM "Page" p
CROSS JOIN LATERAL (
  SELECT * FROM "Sede" ORDER BY "isMain" DESC, "order" ASC LIMIT 1
) s
WHERE p."slug" = 'como-llegar'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b WHERE b."pageId" = p."id" AND b."type" = 'MEDIA_TEXT'
  );

-- 2) Medios de transporte
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'SERVICE_CARDS'::"BlockType",
  COALESCE((SELECT MAX(b."order") + 1 FROM "PageBlock" b WHERE b."pageId" = p."id"), 0),
  '{
    "items": [
      { "icon": "car", "title": "En carro o moto", "text": "Contamos con parqueadero dentro del mall. Usa Waze o Google Maps para la ruta más rápida." },
      { "icon": "taxi", "title": "En taxi o apps", "text": "Indica “Palmas Mall” como destino: todos los conductores de la ciudad lo conocen." },
      { "icon": "bus", "title": "En transporte público", "text": "Llega por las rutas que cubren la Carrera 105 y el sector de Ciudad Jardín, al sur de Cali." },
      { "icon": "pet", "title": "Con tu mascota", "text": "Somos petfriendly: tu mascota es bienvenida en los espacios abiertos del mall." }
    ]
  }'::jsonb,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p."slug" = 'como-llegar'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b WHERE b."pageId" = p."id" AND b."type" = 'SERVICE_CARDS'
  );
