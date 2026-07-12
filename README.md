# Palmas Mall — sitio web + admin

Nueva experiencia digital de **Palmas Mall** (Lifestyle Mall, Colombia): sitio público mobile-first optimizado para SEO/AEO y un panel de administración completo para que el equipo gestione locales, eventos, blog, páginas, galería, popups y navegación sin tocar código.

> El contenido inicial proviene del crawl de palmasmall.com documentado en [`content/source-audit.md`](content/source-audit.md). Lo que no existía en la web original está sembrado como contenido demo marcado con la etiqueta **Placeholder** en el admin.

## Stack

- **Next.js 16** (App Router, Server Components) + **TypeScript**
- **Tailwind CSS v4** + componentes propios estilo shadcn/ui (Radix primitives)
- **Motion** (Framer Motion) para animaciones sutiles con `prefers-reduced-motion`
- **Prisma 6** + **PostgreSQL**
- **Auth.js (NextAuth v5)** con credenciales y roles (Super Admin / Admin / Editor)
- **Cloudinary** para media en producción (fallback local en desarrollo)
- **Zod** para validaciones · **Tiptap** como editor rich text · **Sonner** para toasts
- SEO técnico: metadata dinámica, sitemap dinámico, robots.txt, canonicals, Open Graph, breadcrumbs y JSON-LD (ShoppingCenter, Organization, Store/Restaurant, Event, BlogPosting, FAQPage, BreadcrumbList)

## Desarrollo local

Requisitos: Node.js 20.19+ (recomendado 22 LTS) y PostgreSQL (local o Docker).

```bash
# 1. Dependencias
npm install

# 2. Base de datos (opción rápida con Docker)
docker run -d --name palmasmall-pg \
  -e POSTGRES_USER=palmas -e POSTGRES_PASSWORD=palmas -e POSTGRES_DB=palmasmall \
  -p 127.0.0.1:5433:5432 postgres:16-alpine

# 3. Variables de entorno
cp .env.example .env
# edita DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD

# 4. Migraciones + seed (crea el primer usuario admin y todo el contenido inicial)
npx prisma migrate deploy
npx prisma db seed

# 5. Arrancar
npm run dev            # http://localhost:3000
```

Comandos útiles:

```bash
npm run build          # build de producción
npm run start          # servidor de producción (PORT opcional)
npm run lint           # ESLint
npx prisma studio      # explorar la base de datos
npx prisma migrate dev # crear una nueva migración en desarrollo
```

## Primer usuario admin

El seed crea un **Super Admin** con las credenciales de `ADMIN_EMAIL` / `ADMIN_PASSWORD` del entorno. Entra en **`/admin/login`**, y desde **Admin → Usuarios** crea el resto del equipo (roles Admin y Editor).

**Roles:**

| Permiso | Editor | Admin | Super Admin |
|---|---|---|---|
| Crear/editar contenido (borradores) | ✅ | ✅ | ✅ |
| Publicar / despublicar | ❌ | ✅ | ✅ |
| Eliminar (papelera) / restaurar | ❌ | ✅ | ✅ |
| Eliminación permanente | ❌ | ❌ | ✅ |
| Popups y navegación | ❌ | ✅ | ✅ |
| Configuración global y sedes | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |

## Deploy en Railway

El proyecto está preparado para Railway (no depende de ninguna feature exclusiva de Vercel). `railway.json` ya define build, start, migraciones y healthcheck.

### 1. Crear los servicios

1. En [railway.com](https://railway.com) crea un proyecto nuevo.
2. **Add service → Database → PostgreSQL** (crea la variable `DATABASE_URL` del servicio Postgres).
3. **Add service → GitHub Repo** y conecta este repositorio (deploy automático en cada push).

### 2. Variables de entorno del servicio web

En el servicio de la app (Settings → Variables):

```
DATABASE_URL    = ${{Postgres.DATABASE_URL}}        ← referencia al servicio Postgres
AUTH_SECRET     = (genera uno: openssl rand -base64 32)
NEXTAUTH_URL    = https://<tu-app>.up.railway.app   (o tu dominio final)
AUTH_TRUST_HOST = true
PUBLIC_SITE_URL = https://<tu-app>.up.railway.app   (o https://palmasmall.com)
ADMIN_EMAIL     = admin@palmasmall.com
ADMIN_PASSWORD  = <contraseña-fuerte>
CLOUDINARY_URL  = cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_FOLDER = palmas-mall
```

> Usa la **referencia** `${{Postgres.DATABASE_URL}}` para que la app se conecte por la red privada de Railway.

### 3. Migraciones y seed en Railway

- Las **migraciones corren solas** en cada deploy gracias al `preDeployCommand` (`npx prisma migrate deploy`) de `railway.json`.
- El **seed se corre una sola vez**, manualmente, con el CLI de Railway:

```bash
npm i -g @railway/cli
railway login
railway link          # selecciona el proyecto y el servicio web
railway run npx prisma db seed
```

### 4. Storage de imágenes (obligatorio en producción)

El filesystem de Railway es efímero: **las imágenes subidas desde el admin deben ir a un storage externo**. El proyecto usa **Cloudinary**:

1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. En el Dashboard copia el **API Environment variable** (`cloudinary://…`).
3. Pégalo en la variable `CLOUDINARY_URL` de Railway.

Sin `CLOUDINARY_URL`, en desarrollo las imágenes van a `/public/uploads` (solo dev); en producción el upload devuelve un error explícito.

> ¿Prefieres S3/R2/Supabase Storage? El punto único de integración es `src/lib/storage.ts` (funciones `uploadImage`/`deleteImage`); implementa allí el driver S3 con `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY` y `STORAGE_SECRET_KEY`.

### 5. Healthcheck y logs

- Healthcheck: **`/api/health`** (verifica app + conexión a la base de datos). Ya configurado en `railway.json`.
- Logs: pestaña **Deployments → View logs** del servicio. Los errores de uploads, admin y sitemap se registran con prefijos `[upload]`, `[admin]`, `[storage]`.

## Estructura del proyecto

```
content/source-audit.md      ← auditoría completa de la web original (fuente del seed)
prisma/schema.prisma         ← modelos (User, SiteSettings, Sede, Page, PageBlock, Local,
                                LocalCategory, Event, BlogPost, GalleryAlbum/Image, Popup,
                                Faq, NavigationMenu/Item, MediaAsset, AuditLog, ContactMessage)
prisma/seed.ts               ← seed inicial basado en el audit
proxy.ts                     ← protección de /admin (Next 16 usa proxy.ts, no middleware.ts)
src/app/(public)/…           ← sitio público (18 páginas, mobile-first)
src/app/admin/…              ← panel de administración + server actions
src/app/api/…                ← auth, upload, health
src/components/public/…      ← header, footer, cards, popups, FAQ, plano interactivo…
src/components/admin/…       ← sidebar, formularios, upload drag&drop, editor rich text…
src/lib/…                    ← prisma, auth, permisos, queries, SEO/JSON-LD, storage
```

## Novedades de la ronda 2 (refinamiento)

**Cambios visibles:**
- **Navbar blanco sólido y sticky** en todas las páginas: ya no se superpone al hero; sombra sutil solo al hacer scroll.
- **Menú móvil rediseñado**: overlay a pantalla completa con animación en cascada, scroll bloqueado, cierre con Escape/click en link, accesible (aria-expanded, aria-controls, foco devuelto al botón).
- **Carrusel de fotos en cada local** (`src/components/public/photo-carousel.tsx`): scroll-snap nativo con swipe en móvil, flechas en desktop y dots. Las fotos provienen de las galerías reales del sitio original (hasta 9 por local).
- **CTAs de local jerarquizados** (`src/components/public/local-actions.tsx`): restaurantes priorizan Ver menú/WhatsApp; tiendas priorizan Contactar/Sitio web. Nunca se muestran botones vacíos.
- **Descripciones reescritas** para los 21 locales (corta + larga), con links reales de Instagram/Facebook/TikTok/web/menús extraídos del sitio original, y FAQs por local en los principales restaurantes.
- **Barranquilla eliminada por completo** (no existe esa sede): seed, navegación, footer, schema, sitemap y FAQs solo hablan de Palmas Mall Cali. El modelo `Sede` sigue soportando multi-sede a futuro.
- **Molly, la mascota** (`src/components/public/molly.tsx`): aparece en la esquina inferior izquierda con animación de saludo y speech bubble. En móvil el bubble solo se abre al tocarla (no tapa CTAs); recuerda su cierre por sesión y respeta `prefers-reduced-motion`.

**Molly desde el admin** (Admin → Configuración → "Molly, la mascota", solo Super Admin):
activar/desactivar, imagen **o GIF**, mensaje, texto y enlace del CTA, y visibilidad por dispositivo (móvil/desktop). La imagen oficial es el GIF animado de Molly saludando (`/brand/molly.gif`, alojado localmente desde el Giphy oficial). El campo acepta subir un archivo (PNG/WebP/GIF) **o pegar una URL**: los links de Giphy (página, embed o media) se normalizan solos a la URL directa del `.gif`. Cuando la imagen es animada, el componente no agrega motion extra (el saludo lo trae el GIF).

**Links y menús de un local** (Admin → Locales → editar → "Contacto y enlaces"):
teléfono, WhatsApp, email, sitio web, Instagram, Facebook, TikTok, menú (PDF o link), **link de reservas** y **link de delivery** (campos nuevos). Las URLs se validan al guardar; el frontend solo muestra los botones con datos.

**Carrusel de un local**: usa "Imagen principal" (primera foto) + "Galería" del formulario del local. Sin fotos, la página muestra un placeholder elegante indicando que se pueden subir desde el admin.

**Migración nueva**: `20260709_local_links_and_molly` (campos `reservationUrl`/`deliveryUrl` en Local y configuración de Molly en SiteSettings). En Railway corre sola en el deploy; en local: `npx prisma migrate deploy && npx prisma db seed` (el seed ahora actualiza el contenido de los locales al re-ejecutarse).

**Placeholders pendientes del equipo:** fotos y datos de Hakims' Pastry y Morea, teléfonos/WhatsApp directos por local, horario oficial del mall, eventos y posts reales, y la política de datos definitiva.

## Novedades de la ronda 3 (branding + páginas de local + lightbox)

**Logos y branding:**
- **Navbar**: usa el logo **sin slogan** (`/brand/logo-header.png`, alt "Palmas Mall"), optimizado con `next/image`, sobre fondo blanco sólido. Editable en Admin → Configuración → Identidad → "Logo principal".
- **Slogan "Tus mejores momentos®"** (`/brand/slogan.webp`): se muestra como sello editorial en el home, encima del titular "Mucho más que un centro comercial". **Nunca en el navbar.** Editable en Admin → Configuración → Identidad → "Imagen del slogan".
- El logo completo con slogan (`/brand/palmas-mall.png`) se reserva para login del admin y la página 404.

**Página de local (nueva estructura editorial)** — componentes en `src/components/public/local/`:
1. `LocalHero`: la **imagen principal** del local es el header visual (overlay de legibilidad, nombre y categoría superpuestos, logo del local en desktop). Sin imagen, cae a una banda de marca en verde (sin imágenes rotas ni genéricas).
2. Banda de información: descripción corta + `LocalActionLinks` (CTAs jerarquizados).
3. "Sobre {local}": descripción larga + tags.
4. `LocalImageCarousel` ("Conoce el espacio"): muestra solo las **fotos adicionales** (la principal ya es el hero); con 0 fotos adicionales no se renderiza; con 1 no muestra controles.
5. FAQ del local · `LocalDetails` (horario + ubicación, sticky en desktop) · `LocalRelatedGrid`.

La **imagen principal** se configura en Admin → Locales → editar → "Imágenes" → "Imagen principal"; el carrusel usa el campo "Galería" del mismo formulario. El OG image del local usa la imagen principal (o la primera de la galería).

**Lightbox de Momentos Palmas Mall** (`src/components/public/lightbox-gallery.tsx`, sin librerías):
- Toca cualquier foto de `/momentos-palmas-mall` para verla en grande.
- Swipe en móvil, flechas y ← → en desktop, **Escape** cierra, botón de cierre claro, scroll de fondo bloqueado, foco gestionado (abre en el botón cerrar, vuelve a la miniatura al salir), contador "N de M" y caption/alt visibles.
- La galería del home ahora enlaza a Momentos, donde vive el lightbox.

## Contenido y SEO

- **Todo el contenido editable vive en la base de datos**: textos del hero, locales, eventos, posts, FAQs, menús, ajustes de marca y SEO por página se gestionan desde `/admin`.
- **AEO**: las FAQs (globales y por página/local/evento) se muestran en el sitio y emiten schema `FAQPage`, pensadas para que Google, ChatGPT y Perplexity respondan "¿qué es Palmas Mall?", "¿dónde queda?", "¿es petfriendly?", etc.
- **Sitemap dinámico** en `/sitemap.xml` y robots en `/robots.txt` (bloquea `/admin` y `/api`).
- Los eventos **expiran solos**: al pasar su fecha dejan de aparecer en "Próximos eventos" y quedan en el archivo de eventos pasados.
