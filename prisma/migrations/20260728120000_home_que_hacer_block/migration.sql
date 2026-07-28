-- Data migration: agrega el bloque SERVICE_CARDS ("¿Qué hacer en Palmas Mall?")
-- a la página home con el contenido que hoy está hardcodeado en el frontend.
-- Idempotente: no hace nada si el bloque ya existe o si la página home no existe.
INSERT INTO "PageBlock" ("id", "pageId", "type", "order", "data", "visible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  'SERVICE_CARDS'::"BlockType",
  2,
  '{
    "heading": "¿Qué hacer en Palmas Mall?",
    "intro": "Seis maneras de vivir el mall: elige tu plan de hoy.",
    "items": [
      { "title": "Comer", "text": "El mejor Food Hall de Cali, a la mesa", "href": "/food-drinks", "img": "/images/galeria/20241229_020127780_ios-scaled.webp", "alt": "Food Hall de Palmas Mall iluminado en la noche", "big": true },
      { "title": "Comprar", "text": "Boutiques y marcas exclusivas", "href": "/shop-more", "img": "/images/galeria/dsc1837-scaled.webp", "alt": "Desfile de moda en Palmas Mall" },
      { "title": "Vivir eventos", "text": "Ferias, música y planes cada semana", "href": "/eventos", "img": "/images/galeria/dsc2143-scaled.webp", "alt": "Evento con público en Palmas Mall" },
      { "title": "Venir con tu mascota", "text": "Espacios abiertos y petfriendly", "href": "/conoce-palmas-mall", "img": "/images/galeria/dsc2168-scaled.webp", "alt": "Terrazas al aire libre de Palmas Mall" },
      { "title": "Trabajar o reunirte", "text": "Coworking rodeado de vegetación", "href": "/conoce-palmas-mall", "img": "/images/galeria/shopping-cali2.webp", "alt": "Arquitectura a cielo abierto de Palmas Mall" },
      { "title": "Disfrutar en familia", "text": "PlayZone y actividades para niños", "href": "/play-zone", "img": "/images/galeria/dsc1699-1-scaled.webp", "alt": "Familias disfrutando en Palmas Mall", "big": true }
    ]
  }'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Page" p
WHERE p."slug" = 'home'
  AND NOT EXISTS (
    SELECT 1 FROM "PageBlock" b
    WHERE b."pageId" = p."id" AND b."type" = 'SERVICE_CARDS'
  );
