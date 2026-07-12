# Source Audit — palmasmall.com

> Crawl completo realizado el 2026-07-08 sobre https://palmasmall.com/ (WordPress + Elementor + Rank Math SEO, tema Hello Elementor).
> Este documento es la fuente de verdad para el seed inicial, el contenido base y las decisiones de diseño de la nueva web.
>
> **Nota (2026-07-09):** aunque el sitio original menciona una sede en Barranquilla, actualmente NO existe esa ubicación, por lo que fue **excluida por completo** del sitio nuevo (seed, navegación, footer, schema y sitemap). La web se enfoca únicamente en Palmas Mall Cali.
> **Molly:** el asset oficial de la mascota es el GIF animado de Giphy `https://giphy.com/embed/dxrWewrDSMxJJCXo2i` (palmera saludando), alojado localmente en `/brand/molly.gif` y configurable desde Admin → Configuración → Molly (acepta imagen, GIF o link de Giphy).

---

## 1. Inventario de páginas y URLs actuales

### Páginas (page-sitemap.xml)
| Página | URL actual | Notas |
|---|---|---|
| Home (hub "What to do?") | `https://palmasmall.com/` | Splash/hub con menú radial "What to do?", galardones, momentos, conoce Palmas Mall |
| Cali (landing sede) | `/centro-comercial-cali` | Landing principal de la sede Cali: hero, gastronomía, moda, marcas, plano, ubicación, formulario |
| Contáctanos | `/contactanos` | Formulario PQRS (queja/reclamo/sugerencia) + datos de contacto |
| Política de privacidad | `/politica-de-privacidad` | Legal / tratamiento de datos |

### Directorio y locales (locales_cali-sitemap.xml)
- Listado: `/locales_cali` (20 locales publicados, con filtros)
- Detalle: `/locales_cali/[slug]` — 19 páginas de local (ver §6)

### Categorías (categorias_cali-sitemap.xml / categorias_barranquilla-sitemap.xml)
- Cali: `/cali/food-drinks`, `/cali/gourmet`, `/cali/food-hall`, `/cali/shop-more`, `/cali/shop`, `/cali/more`
- Barranquilla: `/barranquilla/food-hall`, `/barranquilla/shop-more`, `/barranquilla/shop`, `/barranquilla/more`
- Blog categories: `/category/cali`, `/category/barranquilla`

### Posts / noticias (post-sitemap.xml)
| Post | URL | Contenido |
|---|---|---|
| FUTBOL EN PALMAS MALL | `/futbol` | Evento: transmisión Colombia vs Chile (15 oct, 3:00 pm), "los mejores campeonatos del fútbol se viven en Palmas Mall" — sede Barranquilla |
| Cócteles 2x1 viernes de febrero | `/te-esperamos-este-y-todos-los-viernes-de-febrero-cocteles-2x1-y-muchos-mas` | Promo viernes de febrero, cócteles 2x1 — sede Barranquilla |
| (sin título) | `/8491-2` | Devuelve 404 — post roto en el sitemap |

---

## 2. Menú principal (header actual)

**Home (hub):** menú radial "What to do?" → Go to the Mall · Food & Drinks · Shop & More · Be Our Sponsors · Plano del Mall · Cómo llegar · Conoce Palmas Mall · Galardones · Momentos Palmas Mall

**Sede Cali (mega-menú):**
- Inicio
- Quienes somos?
- Food & Drinks → Gourmet · Food Hall
- Shop & More → Shop · More
- Brands (mega-menú por categorías): Shop (Jagi, Milanelo, New Balance, Puma, Rafael Cure, SYN Lab, Toque de Oro) · Coffee (La Herencia by mujeres cafeteras) · Parrilla (Leños & Carbón) · Hamburguesas & Familiar (Crepes & Waffles To Go, Entre Costas, Hamburgo, Viva L'italia) · Postres (Hakims' Pastry, Momo Tea) · Cervecería (BBC Cervecería, The British Ale House) · Internacional (Litany, Tortelli, Takamar)
- Plano del Mall
- Be Our Sponsors
- Contáctanos

**Sede Barranquilla (mega-menú visto en posts):** Coffee (Café la Tagua) · Parrilla (Alitas Bull's Wings) · Hamburguesas & Familiar (La Mars) · Cervecería (Los Artesanos Cervecería y Coctelería) · Internacional (Pummarola) · Shop/More (Guadalupe Reyes, All Baute, Milanelo, Flori, Ananá, Montpellier, Kike Rodríguez, Pradash, Atellier Kids, Bohor, Rosa Eterna, Celash, Pretty Lash, Soluciones Apple, Confecciones Mary, Alba Díaz)

## 3. Footer actual

- Palmas Mall® · Servicio al Cliente (→ /contactanos) · Food & drinks · Brands · Política tratamiento de datos
- Sedes: Cali · Barranquilla
- Redes sociales: Facebook, Instagram, X-Twitter, TikTok, WhatsApp, Waze
- Texto descriptivo: "Vive la mejor experiencia gourmet de la ciudad en el MEJOR FOODHALL de Cali. También déjate sorprender por exclusivas tiendas de moda, su hermosa arquitectura, zona coworking, petfriendly, eventos para toda la familia. En PALMAS MALL® cada experiencia es inolvidable."
- Nota: aparece la palabra "font" suelta en el footer (bug de contenido del sitio actual).

---

## 4. Branding extraído

### Logo
- Logo principal: `wp-content/uploads/2024/02/palmas-mall.png` (728×456) — wordmark "Palmas mall" en verde profundo con 2 palmeras verde lima; tagline "Tus mejores momentos®" en azul-violeta con puntos de colores (amarillo, naranja, verde).
- Logo alternativo (horizontal, para fondos oscuros): `wp-content/uploads/2024/05/palmas-mall-e1715743055674.webp`
- Logo blanco/versión header: `wp-content/uploads/2024/02/palmas-logo.webp`
- Favicon: `wp-content/uploads/2024/02/favicon.png` (186×140, palmeras)

### Paleta (Elementor Global Kit — post-6433.css)
| Token | Hex | Uso |
|---|---|---|
| Primary | `#022112` | Verde bosque casi negro (texto/hero) |
| Secondary | `#2DAB60` | Verde medio |
| Accent | `#73B52C` | Verde lima (CTAs) |
| Text | `#534E4E` | Gris cálido |
| Verde institucional | `#066939` | Verde del wordmark |
| Verde oliva | `#607848`, `#789048` | Secundarios naturales |
| Lima claro | `#ACC811`, `#C0D860` | Acentos vegetación |
| Crema | `#F0F0D8` | Fondo suave |
| Amarillo | `#FAE910` | Punto de color del logo |
| Naranja | `#EE7A2B` | Punto de color del logo |
| Azul-violeta | `#2F2C7D` | Color del tagline "Tus mejores momentos" |
| Neutros | `#1D1D1B`, `#3F3E3E`, `#818181`, `#604848` | Textos/fondos |

### Tipografía actual
- Global: **Lato** (primary, secondary, text, accent)
- Headings decorativos: **Montserrat**
- Puntual: Nunito
- El wordmark del logo usa una serif humanista propia (no replicable con webfont); el tagline usa una script/handwritten.

---

## 5. Contenido institucional (wording actual, textual)

### Conoce Palmas Mall (home)
> "Palmas Mall® trajo a Colombia el concepto de arquitectura comercial: El Lifestyle Mall. Un centro comercial que se implanta cerca a las mejores zonas residenciales de la ciudad para atender y sorprender a sus exigentes residentes. Representa un estilo de vida en donde te sorprende por su hermosa arquitectura y te atrapa con una filosofía de manejo en torno a las experiencias. Busca siempre, como su slogan lo dice, que disfrutes '...Tus mejores momentos...'"

### Hero sede Cali
> "Un lifestyle Mall para que vivas ...Tus mejores momentos...®"

### Experiencia gastronómica (Cali)
> "Palmas Mall® Cali ofrece un FOOD HALL único en el país. Distintas plazas se unen y articulan ofreciendo un mix de SELECCIONADOS restaurantes con diversas corrientes gastronómicas A LA MESA. Su arquitectura de cielo abierto, envuelta en un ambiente lleno de vegetación y creativamente decorado, se convierten en el perfecto lugar para disfrutar de la tan actual corriente SLOW FOOD. A tu mesa llegarán las más variadas delicias gastronómicas de uno o todos los restaurantes; atendido por sus respectivos meseros."

### Moda (Cali)
> "En Palmas Mall® donde la moda cobra vida. Explora tendencias globales en boutiques exclusivas y concept stores seleccionadas para una experiencia de compra única. Bienvenido a un destino donde cada elección de moda cuenta una historia personal."

### El encanto (Cali)
> "Palmas Mall® es un lugar diseñado bajo una arquitectura que estimula la creación de experiencias envolventes en torno a propuestas gastronómicas variadas y de estilo de vida, como moda, belleza y variedades, reuniendo a los mejores exponentes y marcas creando una propuesta única en la ciudad."

### Galardones
1. **FIABCI — Premio a la Excelencia Inmobiliaria**: "PALMAS MALL® Cali: premio nacional en categoría comercio otorgado por Federación Internacional de Profesionales Inmobiliarios, FIABCI." (imagen: `2024/02/G1.png`)
2. **ICSC SILVER AWARD 2009 — For Development & Design Excellence**: "El centro comercial ha sido galardonado con el premio SILVER AWARD 2009, otorgado por la ICSC International Council Of Shopping Centers, que es la agremiación más importante y grande de centros comerciales del mundo, en la categoría de Innovative Design and Development Of A New Projects." (imagen: `2024/02/G2.png`)

### Otros
- Botón flotante/CTA: "MOLLY te invita a conocer PlayZone" → video `2026/02/video-pantallas-para-web.mp4` (zona de juegos infantil PlayZone con mascota MOLLY)
- "Descubre nuestros eventos" (CTA en hero Cali)
- Página 404 actual: "error 404 — Página no encontrada — home"
- Popup/menciones sueltas: "Franchesca", "La herencia by Mujeres cafeteras"

---

## 6. Locales encontrados (sede Cali — 20 publicados)

Categorías actuales: **Food & Drinks** (Gourmet, Food Hall) y **Shop & More** (Shop, More). Subcategorías del mega-menú: Coffee, Parrilla, Hamburguesas & Familiar, Postres, Cervecería, Internacional, Shop.

| Local | Slug | Categoría | Descripción original | Horario | Extra |
|---|---|---|---|---|---|
| TAKAMAR | takamar-sushi | Food Hall / Internacional (sushi) | "Somos TAKAMAR, y nacimos para revolucionar tu experiencia con el sushi… ¡Vení y unite a la revolución del sushi!" | Dom–Mié 12pm–10pm · Jue–Sáb 12pm–11pm | |
| PUMA | puma | Shop | Sin descripción ("Info aquí.") | — | imágenes 2025/09 |
| JAGI | jagi | Shop | Sin descripción | — | capturas 2026/06 |
| MOMO TEA | momo-tea | Postres | Sin descripción | — | fotos bubble tea |
| MOREA | morea-proximamente | Shop | "PRÓXIMAMENTE" | — | imagen `2026/03/morea.webp` |
| ENTRE COSTAS | entre-costas | Hamburguesas & Familiar | Sin descripción | Lun cerrado · Vie–Sáb 12M–3pm / 7pm–11pm · Dom 12M–5pm | menú: menupp.co/entrecostas |
| NEW BALANCE | new-balance | Shop | Sin descripción | Lun–Sáb 10am–8pm · Dom 10am–8pm | |
| RAFAEL CURE | rafael-cure | Shop (sastrería/moda masculina) | Sin descripción | Lun–Sáb 10am–7pm · Dom 10am–5pm | |
| TORTELLI | tortelli | Internacional (italiano) | Sin descripción | Lun–Jue 12–10pm · Vie 12–11pm · Sáb 12–10pm · Dom 12–9pm | |
| THE BRITISH ALE HOUSE | the-british-ale-house | Cervecería | Sin descripción | — | fotos 2025/05 |
| VIVA L'ITALIA | viva-litalia | Hamburguesas & Familiar (pizza) | "Local: 5-1. Pizzas al horno de barro & pastas artesanales. Sabor italiano hecho con amor y tradición" | — | |
| CREPES & WAFFLES to go | crepes-waffles | Hamburguesas & Familiar | "Esta cadena de restaurantes colombiana ha conquistado el corazón de los comensales… un clásico desde 1988…" | Lun–Jue 11:40am–9:30pm · Vie–Sáb 11:40am–10pm · Dom 11:40am–9:30pm | "ver catálogo" |
| LEÑOS Y CARBÓN | lenos-y-carbon | Parrilla | "Local: 07. En Leños & Carbón, contamos con un menú con más de 40 generosos y sabrosos platos… restaurante de tradición… desde hace 15 años…" | Lun–Jue 11am–10pm · Vie–Sáb 11am–11pm · Dom 11am–10pm | |
| HAMBURGO | hamburgo | Hamburguesas & Familiar | Sin descripción | Vie–Sáb 12M–11pm · Dom 12M–10pm | menú: menupp.co/hamburgo |
| LA HERENCIA by mujeres cafeteras | la-herencia | Coffee | Sin descripción | Todos los días 8am–9pm | menú: menupp.co/herencia |
| BBC CERVECERÍA | bbc-cerveceria | Cervecería | "Local: 9. Sitio de descanso: Cervecería. Su producto es la cerveza artesanal." | Lun–Mar 4pm–11pm · Vie–Sáb 4pm–2am · Dom 4pm–12am | |
| SYN LAB | syn-lab | More (laboratorio clínico) | Sin descripción | Lun–Vie 6am–12pm / 1pm–3pm · Sáb 6am–12pm · Dom cerrado | |
| TOQUE DE ORO | toque-de-oro | Shop (joyería) | Sin descripción | Todos los días 12pm–7pm | |
| LITANY | litany | Internacional | Sin descripción | Lun–Jue 12–3pm / 6–10pm · Vie–Sáb 12M–11pm · Dom 12–5pm | menú: litany.cluvi.co |
| MILANELO | milanelo | Shop (heladería/moda) | Sin descripción | Lun–Sáb 10:30am–7:30pm · Dom cerrado | |

**En mega-menú pero sin página:** Hakims' Pastry (Postres).
**Brochure general de sponsors:** `wp-content/uploads/2024/07/brochure-oct.-dic.pdf` ("Be Our Sponsors").

### Locales sede Barranquilla (solo en menú, sin páginas publicadas)
Café la Tagua (Coffee), Alitas Bull's Wings (Parrilla), La Mars (Hamburguesas & Familiar), Los Artesanos Cervecería y Coctelería (Cervecería), Pummarola (Internacional), Guadalupe Reyes, All Baute, Milanelo, Flori, Ananá, Montpellier, Kike Rodríguez, Pradash, Atellier Kids, Bohor, Rosa Eterna, Celash, Pretty Lash, Soluciones Apple, Confecciones Mary, Alba Díaz.

---

## 7. Datos de contacto y sedes

### Sede Cali (principal)
- Dirección: **Carrera 105 No. 15-09, Cali, Valle del Cauca**
- Teléfono/WhatsApp principal: **+57 315 284 2989** (`wa.me/+573152842989`)
- Celular servicio al cliente: **316 742 08 65**
- Email: **palmasmall@palmasmall.com**
- Waze: `https://www.waze.com/en/live-map/directions/palmas-mall-carrera-105-15-09-cali?place=w.185794594.1857749328.556689`
- Horario (JSON-LD actual, probablemente desactualizado): Lun–Dom 09:00–17:00

### Sede Barranquilla
- Dirección (del link de Waze): **Carrera 51B No. 82-100, Barranquilla, Atlántico**
- Teléfono (visto en posts): **+57 318 243 2192**
- Waze: `https://www.waze.com/en/live-map/directions/centro-comercial-palmas-mall-carrera-51-b-82-100-barranquilla?to=place.w.186908782.1868956749.1532255`

### Redes sociales
- Facebook: `https://www.facebook.com/share/j4MGU5uatqoQ8VzC/` (link de share, no URL canónica de página)
- Instagram: `https://www.instagram.com/palmasmallcali`
- TikTok: `https://www.tiktok.com/@palmasmallcali`
- X/Twitter: `https://x.com/palmasmallcali`
- WhatsApp: `http://wa.me/+573152842989`

---

## 8. Plano del mall

- Imagen actual: `wp-content/uploads/2026/06/plano-general-junio-scaled.png` (PNG 5.2 MB — muy pesado, sin optimizar)
- Enlace del menú: `/centro-comercial-cali/#mapa_cali`

## 9. Imágenes y galería ("Momentos Palmas Mall")

Galería del home (fotos reales del mall, formato webp `scaled` ~2560px):
- `2025/02/dsc1563-scaled.webp`, `dsc1638`, `dsc1699-1`, `dsc1837`, `dsc2143`, `dsc2168` (eventos, moda, feria market)
- `2025/02/20241229_020127780_ios-scaled.webp`, `20241229_020516058`, `20241229_021012195`, `20241230_014309000_ios-1`, `20241230_023016102`, `20250119_193238112` (decoración navideña, ambiente nocturno)
- `2025/02/shopping-cali2.webp`, `fmodelreescalada.webp` (arquitectura/experiencia)
- Hero/arquitectura: `2026/06/firefly_generea-esta-misma-imagen…*.png` (imágenes retocadas con IA del edificio), `2026/01/zz1.webp`–`zz5.webp`, `2026/06/junio-8.png`, `junio-9.png`
- Galardones: `2024/02/G1.png` (FIABCI), `2024/02/G2.png` (ICSC)
- Las fotos muestran: arquitectura a cielo abierto, vegetación tropical, ferias/market, moda, familias, zona infantil (PlayZone), decoración navideña.

## 10. SEO actual

- Plugin: Rank Math. Sitemap index en `/sitemap_index.xml`. Robots.txt estándar WP.
- Title del home: **"Palmas Mall - Palmas Mall"** (duplicado, pobre)
- Meta description del home: recortada a mitad de frase ("…que es")
- JSON-LD actual: LocalBusiness+Organization con `openingHours` genérico 09:00–17:00 (incorrecto), logo, WebSite con SearchAction.
- og:locale `es_ES` (debería ser `es_CO`).
- Sin schema por local, sin Event, sin BreadcrumbList, sin FAQPage.

---

## 11. Problemas actuales detectados

### UX
1. Home tipo "splash" con menú radial "What to do?" confuso: no comunica de inmediato qué es Palmas Mall ni dónde queda; mezcla inglés/español sin criterio.
2. Doble arquitectura confusa: home genérico + landing `/centro-comercial-cali`; Barranquilla existe en menús/footers pero no tiene landing ni directorio publicado.
3. Mega-menú "Brands" enorme y difícil de usar en móvil (lista plana de 20+ items anidados).
4. Sin buscador ni filtros útiles en el directorio (solo un dropdown "- Seleccionar -").
5. La mayoría de locales no tienen descripción ("Info aquí."), ni teléfono, ni Instagram, ni número de local.
6. Horarios inconsistentes y mal estructurados (campos "Lunes a jueves" con textos de otros días adentro).
7. "Plano del Mall" es una imagen PNG de 5 MB sin zoom ni interactividad.
8. No hay página de eventos: los eventos se publican como posts sueltos y quedan desactualizados (partido de octubre aún publicado).
9. No hay "Cómo llegar" como página: solo links de Waze dispersos.
10. Texto "font" suelto en el footer (bug visible).
11. Post roto en sitemap (`/8491-2` → 404).

### SEO / contenido
12. Titles y descriptions duplicados o truncados; sin metadata única por página.
13. openingHours del schema incorrecto; og:locale mal configurado.
14. Sin schema Store/Restaurant por local, sin Event, sin FAQ, sin breadcrumbs.
15. Contenido con errores tipográficos ("conoocepalmas", "BCC/BBC Cervecería" inconsistente, mayúsculas aleatorias).
16. Sin blog activo ni contenido AEO (nadie responde "¿qué es Palmas Mall?", "¿es petfriendly?").

### Performance / responsive
17. Elementor carga 25+ hojas CSS y varias librerías de animación → LCP lento.
18. Imágenes `-scaled` de 2560px y PNGs de 5 MB servidas sin `srcset` adecuado.
19. Video de fondo en hero sin poster optimizado.

## 12. Oportunidades de mejora

1. Home que comunique en 5 segundos: qué es (Lifestyle Mall), dónde (Cali/Barranquilla), qué ofrece (Food Hall, tiendas, eventos, petfriendly, coworking) y CTAs claros (Explorar locales / Cómo llegar / Ver eventos).
2. Directorio de locales con búsqueda, filtros por categoría y páginas individuales SEO (schema Store/Restaurant, horarios estructurados, CTAs de WhatsApp/Instagram/menú).
3. Módulo de eventos con fechas de inicio/fin y estado (así los eventos viejos expiran solos).
4. Sección FAQ editable en páginas clave (AEO para Google/ChatGPT/Perplexity).
5. Plano del mall optimizado (imagen comprimida + zoom/pan).
6. Página "Cómo llegar" con Waze, Google Maps, transporte y horarios por sede.
7. Sistema multi-sede (Cali + Barranquilla) desde el modelo de datos.
8. Galería "Momentos" administrable con álbumes.
9. Popups configurables no invasivos (reemplazan el botón "MOLLY/PlayZone").
10. Rebranding digital: conservar verdes + acentos del logo con una ejecución más editorial y premium.

## 13. Contenido faltante → placeholders editables desde admin

Marcar como `[PLACEHOLDER]` en el seed (el equipo lo edita en /admin):
- Descripciones de la mayoría de locales (PUMA, JAGI, NEW BALANCE, etc.), teléfonos, Instagram y número de local por local.
- Horario general oficial del mall por sede (el actual 9:00–17:00 es dudoso).
- Datos completos de la sede Barranquilla (horarios, email, locales publicables, plano).
- Eventos reales próximos (se siembran eventos demo marcados como placeholder).
- Posts de blog/noticias reales (se siembran 3 demo).
- Página/beneficios de coworking y política petfriendly detallada (solo se mencionan como amenidades).
- Fotos en alta de arquitectura para hero (las actuales están retocadas con IA y tienen nombres de archivo largos).
- URL canónica de la página de Facebook (hoy es un share-link).
- Menú PDF por restaurante (hoy solo 3 tienen link externo menupp/cluvi).

## 14. Assets descargados para el proyecto

Guardados en `public/brand/` y `public/images/` (origen: palmasmall.com):
- `palmas-mall.png` (logo principal), `palmas-logo.webp` (logo header), `favicon.png`
- `G1.png` (FIABCI), `G2.png` (ICSC Silver Award)
- `plano-general-junio-scaled.png` (plano del mall — recomprimir)
- Galería: `dsc1563/1638/1699/1837/2143/2168`, fotos nocturnas/navideñas `20241229/20241230/20250119`, `shopping-cali2.webp`, `fmodelreescalada.webp`
