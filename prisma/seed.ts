/**
 * Seed inicial de Palmas Mall.
 * Contenido tomado del crawl de palmasmall.com documentado en /content/source-audit.md:
 * galerías de fotos reales, links de menú/redes reales y descripciones reescritas
 * con base en el contenido original. Lo que no existía se marca con
 * isPlaceholder: true (editable desde /admin).
 *
 * El seed es idempotente y ACTUALIZA el contenido de los locales al re-ejecutarse
 * (los cambios hechos en admin sobre locales sembrados se sobreescriben si corres
 * el seed de nuevo; en producción córrelo una sola vez).
 */
import { PrismaClient, ContentStatus, FaqScope, BlockType } from "@prisma/client";
import { hash } from "bcryptjs";
import localMediaRaw from "./local-media.json";

// Covers + galerías de locales centralizadas en Cloudinary (match exacto con
// el carrusel de palmasmall.com). Regenerable desde el script de subida.
const LOCAL_MEDIA = localMediaRaw as Record<string, { cover: string; gallery: string[] }>;

const prisma = new PrismaClient();

const PH = "[Contenido de ejemplo - edítalo desde el admin] ";
const U = "https://palmasmall.com/wp-content/uploads";

// Assets centralizados en Cloudinary (subidos desde los originales de palmasmall.com).
const CLOUDINARY = {
  sponsorPdf: "https://res.cloudinary.com/auan6rju/image/upload/v1784293062/palmas-mall/sponsors/nj1crjyxoegotzp9oi83.pdf",
  sponsorVideo: "https://res.cloudinary.com/auan6rju/video/upload/v1784293063/palmas-mall/sponsors/menzla3kxxymp9dszrpx.mp4",
  playzoneVideo: "https://res.cloudinary.com/auan6rju/video/upload/v1784293064/palmas-mall/playzone/fgkzfthufpmvqvfqhgq9.mp4",
  plano: "https://res.cloudinary.com/auan6rju/image/upload/v1784560442/palmas-mall/plano/woklnukzucnnggeaqkdj.pdf",
};

// Política de tratamiento de datos (contenido oficial, editable desde /admin).
const POLICY_HTML = `
<h2>Política para el tratamiento de datos personales de la copropiedad Palmas Mall®</h2>
<h3>Ámbito de aplicación</h3>
<p>PALMAS MALL® PROPIEDAD HORIZONTAL (NIT 900.003.968-2) informa a sus accionistas, trabajadores, candidatos a empleo, proveedores y arrendatarios sobre su política de tratamiento de datos personales, en cumplimiento del artículo 15 de la Constitución Política, la Ley 1581 de 2012 y sus decretos reglamentarios.</p>

<h3>Definiciones</h3>
<ul>
<li><strong>Autorización:</strong> consentimiento previo, expreso e informado del Titular para llevar a cabo el tratamiento de datos personales.</li>
<li><strong>Base de datos:</strong> conjunto organizado de datos personales objeto de tratamiento.</li>
<li><strong>Dato personal:</strong> cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
<li><strong>Dato público:</strong> dato calificado como tal según la ley o la Constitución, y que no sea semiprivado, privado o sensible.</li>
<li><strong>Datos sensibles:</strong> aquellos que afectan la intimidad del Titular o cuyo uso indebido puede generar discriminación (origen racial, orientación política, convicciones religiosas, datos de salud, vida sexual y datos biométricos).</li>
<li><strong>Encargado del tratamiento:</strong> persona que realiza el tratamiento de datos por cuenta del responsable.</li>
<li><strong>Responsable del tratamiento:</strong> persona que decide sobre la base de datos y el tratamiento de los datos.</li>
<li><strong>Titular:</strong> persona natural cuyos datos personales son objeto de tratamiento.</li>
<li><strong>Tratamiento:</strong> operación sobre datos personales como recolección, almacenamiento, uso, circulación o supresión.</li>
</ul>

<h3>Tratamiento y finalidad</h3>
<p>El responsable recolecta, almacena, usa, circula y suprime datos de accionistas, trabajadores, candidatos, proveedores y arrendatarios para el cumplimiento de sus objetivos organizacionales, respetando los principios de la Ley 1581 de 2012.</p>

<h3>Canales de recolección</h3>
<p><strong>Canal físico:</strong> hoja de vida, documento de identidad y datos personales (nombre, fecha y lugar de nacimiento, dirección de residencia, teléfono, correo, género, estado civil) e información financiera cuando corresponda.</p>
<p><strong>Canal digital:</strong> formularios en línea, correo electrónico, llamadas telefónicas y páginas web. El responsable se compromete a recolectar únicamente la información pertinente a sus finalidades.</p>

<h3>Finalidades del tratamiento</h3>
<ul>
<li>Cumplir deberes legales y reglamentarios.</li>
<li>Gestionar la relación con accionistas, trabajadores, candidatos, proveedores y arrendatarios.</li>
<li>Atender peticiones, quejas, reclamos y sugerencias (PQRS).</li>
<li>Adelantar procesos de selección de personal.</li>
<li>Ejecutar contratos con proveedores y arrendatarios.</li>
<li>Realizar actividades de mercadeo, publicidad y promoción, y ofrecer productos y servicios.</li>
<li>Realizar encuestas y sondeos de opinión.</li>
</ul>

<h3>Derechos del titular</h3>
<ul>
<li>Conocer, actualizar y rectificar sus datos personales.</li>
<li>Solicitar prueba de la autorización otorgada.</li>
<li>Ser informado sobre el uso que se ha dado a sus datos.</li>
<li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
<li>Revocar la autorización y solicitar la supresión del dato cuando se vulneren los principios legales.</li>
<li>Acceder de forma gratuita a sus datos personales objeto de tratamiento.</li>
</ul>

<h3>Contacto para ejercer sus derechos</h3>
<p>Correo electrónico: palmasmall@palmasmall.com. Dirección: Carrera 105 No. 15-09, Ciudad Jardín, Cali, en el corazón de la Milla de Oro.</p>

<h3>Vigencia</h3>
<p>Esta política rige a partir de su publicación y aplica a todas las personas cuyos datos sean tratados por el responsable. Cualquier modificación sustancial será comunicada oportunamente.</p>
`.trim();

async function main() {
  console.log("→ Seed Palmas Mall");

  // ── Usuario Super Admin ─────────────────────────────────────
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@palmasmall.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "PalmasMall2026!";
  const passwordHash = await hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: "Super Admin", passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`  ✓ Super admin: ${adminEmail}`);

  // ── Configuración global ────────────────────────────────────
  // Molly invita al PlayZone; assets de Be Our Sponsors centralizados en Cloudinary.
  const settingsSeed = {
    mollyMessage: "¡Hola! Soy Molly 🌴 ¿Ya conoces el PlayZone? El plan favorito de los peques te espera.",
    mollyCtaLabel: "Ir al PlayZone",
    mollyCtaUrl: "/play-zone",
    sponsorPdfUrl: CLOUDINARY.sponsorPdf,
    sponsorVideoUrl: CLOUDINARY.sponsorVideo,
    planoImageUrl: CLOUDINARY.plano,
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: settingsSeed,
    create: { id: 1, ...settingsSeed },
  });

  // ── Sede (solo Cali: no existe sede en Barranquilla) ────────
  const cali = await prisma.sede.upsert({
    where: { slug: "cali" },
    update: { isMain: true },
    create: {
      slug: "cali",
      name: "Palmas Mall Cali",
      city: "Cali",
      address: "Carrera 105 No. 15-09, Ciudad Jardín, Cali",
      phone: "+57 315 284 2989",
      whatsapp: "573152842989",
      email: "palmasmall@palmasmall.com",
      openingHours: "Lunes a domingo · 10:00 a.m. – 10:00 p.m.",
      wazeUrl:
        "https://www.waze.com/en/live-map/directions/palmas-mall-carrera-105-15-09-cali?place=w.185794594.1857749328.556689",
      mapsUrl: "https://maps.google.com/?q=Palmas+Mall+Carrera+105+15-09+Cali",
      isMain: true,
      order: 0,
    },
  });
  // Limpieza: si una versión anterior del seed creó Barranquilla, eliminarla
  await prisma.sede.deleteMany({ where: { slug: "barranquilla" } });
  console.log("  ✓ sede Cali (Barranquilla eliminada si existía)");

  // ── Categorías de locales ───────────────────────────────────
  const categories: { slug: string; name: string; group: string }[] = [
    { slug: "coffee", name: "Coffee", group: "food-drinks" },
    { slug: "parrilla", name: "Parrilla", group: "food-drinks" },
    { slug: "hamburguesas-familiar", name: "Hamburguesas & Familiar", group: "food-drinks" },
    { slug: "postres", name: "Postres", group: "food-drinks" },
    { slug: "cerveceria", name: "Cervecería", group: "food-drinks" },
    { slug: "internacional", name: "Internacional", group: "food-drinks" },
    { slug: "moda", name: "Moda", group: "shop-more" },
    { slug: "deporte", name: "Deporte", group: "shop-more" },
    { slug: "joyeria", name: "Joyería", group: "shop-more" },
    { slug: "salud-belleza", name: "Salud & Belleza", group: "shop-more" },
    { slug: "servicios", name: "Servicios", group: "shop-more" },
    { slug: "entretenimiento", name: "Entretenimiento", group: "shop-more" },
  ];
  const catId: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const cat = await prisma.localCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, order: i },
    });
    catId[c.slug] = cat.id;
  }

  // ── Locales (galerías y links reales del sitio original) ────
  type SeedLocal = {
    slug: string;
    name: string;
    cat: string;
    short: string;
    long: string;
    hours?: { days: string; hours: string }[];
    unit?: string;
    menuUrl?: string;
    deliveryUrl?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    cover?: string;
    gallery?: string[];
    restaurant?: boolean;
    featured?: boolean;
    comingSoon?: boolean;
    placeholder?: boolean;
    tags?: string[];
    faqs?: { q: string; a: string }[];
  };

  const locales: SeedLocal[] = [
    {
      slug: "takamar",
      name: "Takamar",
      cat: "internacional",
      restaurant: true,
      featured: true,
      short: "La revolución del sushi en Cali: rollos frescos, sabor de autor y precio justo.",
      long: "Takamar nació para revolucionar tu experiencia con el sushi. Cada rollo se prepara al momento con ingredientes frescos y una explosión de sabor que combina calidad y precio justo. Ven al Food Hall de Palmas Mall y únete a la revolución del sushi: una experiencia tan asequible como inolvidable.",
      hours: [
        { days: "Domingo a miércoles", hours: "12:00 p.m. – 10:00 p.m." },
        { days: "Jueves a sábado", hours: "12:00 p.m. – 11:00 p.m." },
      ],
      instagramUrl: "https://www.instagram.com/takamarsushi/",
      cover: `${U}/2026/04/img_3927-scaled.jpg`,
      gallery: [
        `${U}/2026/04/img_3927-scaled.jpg`,
        `${U}/2024/03/takamar-roll.jpg`,
        `${U}/2024/03/ym3s8_takamar-sushi.webp`,
      ],
      tags: ["sushi", "asiática", "food hall"],
      faqs: [
        {
          q: "¿Dónde queda Takamar en Palmas Mall?",
          a: "Takamar está en el Food Hall de Palmas Mall, Carrera 105 No. 15-09, Ciudad Jardín, Cali. Puedes pedir a la mesa desde cualquier plaza del Food Hall.",
        },
        {
          q: "¿Qué tipo de comida sirve Takamar?",
          a: "Sushi y cocina asiática: rollos preparados al momento con ingredientes frescos, con opciones para compartir.",
        },
      ],
    },
    {
      slug: "crepes-and-waffles-to-go",
      name: "Crepes & Waffles To Go",
      cat: "hamburguesas-familiar",
      restaurant: true,
      featured: true,
      short: "El clásico colombiano desde 1988: crepes, waffles, helados artesanales y brunch.",
      long: "La cadena colombiana que conquistó el corazón de los comensales llega a Palmas Mall en su formato To Go. Su menú va más allá de crepes y waffles: ensaladas creativas, helados artesanales y un brunch que es un clásico desde 1988, con el compromiso de calidad e impacto social que la hace inconfundible.",
      hours: [
        { days: "Lunes a jueves", hours: "11:40 a.m. – 9:30 p.m." },
        { days: "Viernes y sábado", hours: "11:40 a.m. – 10:00 p.m." },
        { days: "Domingos y festivos", hours: "11:40 a.m. – 9:30 p.m." },
      ],
      deliveryUrl: "https://domicilios.crepesywaffles.com/",
      instagramUrl: "https://www.instagram.com/crepesywaffles/",
      cover: `${U}/2024/07/crepsfoto.jpg`,
      gallery: [
        `${U}/2024/07/crepe-poblana.jpg`,
        `${U}/2024/07/dsc_0182-crepe-nutella-fresa-sku-50516-copia-2.jpg`,
        `${U}/2024/07/crepsfoto.jpg`,
        `${U}/2024/07/crepes-waffles-atlantis-1.jpg`,
        `${U}/2024/07/20171127-153758-largejpg.jpg`,
      ],
      tags: ["crepes", "helados", "familiar"],
      faqs: [
        {
          q: "¿Crepes & Waffles de Palmas Mall tiene domicilios?",
          a: "Sí, puedes pedir a domicilio desde domicilios.crepesywaffles.com o disfrutar el formato To Go dentro del mall.",
        },
      ],
    },
    {
      slug: "lenos-y-carbon",
      name: "Leños & Carbón",
      cat: "parrilla",
      restaurant: true,
      featured: true,
      unit: "07",
      short: "Parrilla de tradición: más de 40 platos generosos, carnes y picadas para compartir.",
      long: "Con más de 40 platos generosos, en Leños & Carbón llegas antojado de una punta de anca y terminas eligiendo una trucha a la plancha: hay cosas que solo pasan aquí. Un restaurante de tradición con más de 15 años haciendo parte de los mejores momentos de la ciudad, ideal para picadas en compañía de amigos y familia.",
      hours: [
        { days: "Lunes a jueves", hours: "11:00 a.m. – 10:00 p.m." },
        { days: "Viernes y sábado", hours: "11:00 a.m. – 11:00 p.m." },
        { days: "Domingos y festivos", hours: "11:00 a.m. – 10:00 p.m." },
      ],
      instagramUrl: "https://www.instagram.com/lenos_carbon/",
      cover: `${U}/2024/03/lenos-y-carbon.webp`,
      gallery: [`${U}/2024/03/lenos-y-carbon.webp`],
      tags: ["parrilla", "carnes", "familiar"],
      faqs: [
        {
          q: "¿Qué se come en Leños & Carbón de Palmas Mall?",
          a: "Parrilla y comida colombiana: carnes a la brasa, picadas para compartir, trucha y más de 40 platos generosos. Está en el local 07.",
        },
      ],
    },
    {
      slug: "bbc-cerveceria",
      name: "BBC Cervecería",
      cat: "cerveceria",
      restaurant: true,
      unit: "9",
      short: "Cerveza artesanal de Bogotá Beer Company en la terraza de Palmas Mall.",
      long: "El plan perfecto para la tarde y la noche: la cerveza artesanal de Bogotá Beer Company en un espacio de descanso al aire libre. Ven por una rubia, roja o negra bien fría, quédate por el ambiente de la terraza de Palmas Mall.",
      hours: [
        { days: "Lunes y martes", hours: "4:00 p.m. – 11:00 p.m." },
        { days: "Viernes y sábado", hours: "4:00 p.m. – 2:00 a.m." },
        { days: "Domingos y festivos", hours: "4:00 p.m. – 12:00 a.m." },
      ],
      websiteUrl: "https://www.bbccerveceria.com/productos-bbc",
      facebookUrl: "https://www.facebook.com/BCCcerveceriaCO",
      instagramUrl: "https://www.instagram.com/bbcpalmasmallcali/",
      cover: `${U}/2024/07/20240711_160720_11zon-scaled.jpg`,
      gallery: [
        `${U}/2024/03/cerveceria-bbc-1.jpg`,
        `${U}/2024/03/cerveceria-bbc-2.jpg`,
        `${U}/2024/03/cerveceria-bbc-3.jpg`,
        `${U}/2024/03/cerveceria-bbc-6.jpg`,
        `${U}/2024/07/20240711_160720_11zon-scaled.jpg`,
      ],
      tags: ["cerveza artesanal", "bar", "terraza"],
      faqs: [
        {
          q: "¿Hasta qué hora abre BBC en Palmas Mall?",
          a: "Los viernes y sábados la cervecería abre hasta las 2:00 a.m.; domingos y festivos hasta las 12:00 a.m. Está en el local 9.",
        },
      ],
    },
    {
      slug: "viva-litalia",
      name: "Viva L'Italia",
      cat: "hamburguesas-familiar",
      restaurant: true,
      unit: "5-1",
      short: "Pizzas al horno de barro y pastas artesanales: sabor italiano hecho con amor.",
      long: "Pizza al horno de barro con masa artesanal y pastas hechas en casa: Viva L'Italia trae al Food Hall de Palmas Mall el sabor de Italia preparado con amor y tradición. Perfecto para un plan en pareja o una cena familiar.",
      instagramUrl: "https://www.instagram.com/viva.laitalia/",
      cover: `${U}/2025/04/ec659a56-03a8-41ec-8a94-b1dea7a2ee76-e1744497971529.jpeg`,
      gallery: [`${U}/2025/04/ec659a56-03a8-41ec-8a94-b1dea7a2ee76-e1744497971529.jpeg`],
      tags: ["pizza", "italiana", "pastas"],
    },
    {
      slug: "hamburgo",
      name: "Hamburgo",
      cat: "hamburguesas-familiar",
      restaurant: true,
      short: "Hamburguesas artesanales con pan horneado y combinaciones de autor.",
      long: "Hamburguesas hechas a mano con ingredientes frescos y combinaciones de autor que se volvieron favoritas del Food Hall. Pide la tuya al punto, acompáñala con papas y disfrútala en las terrazas a cielo abierto de Palmas Mall.",
      hours: [
        { days: "Viernes y sábado", hours: "12:00 m. – 11:00 p.m." },
        { days: "Domingos y festivos", hours: "12:00 m. – 10:00 p.m." },
      ],
      menuUrl: "https://menupp.co/hamburgo",
      instagramUrl: "https://www.instagram.com/hamburgo_pcb/",
      cover: `${U}/2024/07/443822822_917081553763011_7423172666296387024_n.jpg`,
      gallery: [
        `${U}/2024/07/443822822_917081553763011_7423172666296387024_n.jpg`,
        `${U}/2024/07/438078904_895746845896482_7204653412603919063_n.jpg`,
        `${U}/2024/07/438681628_895744302563403_6296570233159277102_n.jpg`,
        `${U}/2024/07/450801213_1914819152285662_4008892212045500205_n.jpeg`,
        `${U}/2024/07/20240711_1607270_11zon-scaled.jpg`,
      ],
      tags: ["hamburguesas", "food hall"],
    },
    {
      slug: "entre-costas",
      name: "Entre Costas",
      cat: "internacional",
      restaurant: true,
      short: "Fusión peruano-colombiana: mariscos, sabores de mar y un nuevo concepto de cocina.",
      long: "Entre Costas fusiona la cocina peruana y la colombiana para crear un nuevo concepto de sabores: pescados frescos, mariscos y platos de mar inspirados en las dos costas. Una experiencia gourmet para descubrir en el Food Hall de Palmas Mall.",
      hours: [
        { days: "Martes a sábado", hours: "12:00 m. – 3:00 p.m. · 7:00 p.m. – 11:00 p.m." },
        { days: "Domingos y festivos", hours: "12:00 m. – 5:00 p.m." },
        { days: "Lunes", hours: "Cerrado" },
      ],
      menuUrl: "https://menupp.co/entrecostas",
      instagramUrl: "https://www.instagram.com/entrecostasrestaurante",
      cover: `${U}/2024/02/img_9722-scaled-e1742046215352.jpg`,
      gallery: [
        `${U}/2024/02/entrecostas-3.jpg`,
        `${U}/2024/02/entrecostas-4.jpg`,
        `${U}/2024/02/13264626-ec68-4478-859f-333490f616ab.jpg`,
        `${U}/2024/02/img_9722-scaled-e1742046215352.jpg`,
      ],
      tags: ["mariscos", "peruana", "fusión"],
      faqs: [
        {
          q: "¿Qué tipo de comida sirve Entre Costas?",
          a: "Cocina de mar con fusión peruano-colombiana: ceviches, mariscos y pescados frescos inspirados en las costas de ambos países.",
        },
      ],
    },
    {
      slug: "la-herencia",
      name: "La Herencia by Mujeres Cafeteras",
      cat: "coffee",
      restaurant: true,
      featured: true,
      short: "Café de origen cultivado y preparado por mujeres cafeteras colombianas.",
      long: "Cada taza de La Herencia cuenta la historia de las mujeres cafeteras de Colombia: café de origen cultivado, procesado y preparado por ellas. Acompáñalo con desayunos, ensaladas o una tabla de quesos, todos los días desde las 8:00 a.m.",
      hours: [{ days: "Todos los días", hours: "8:00 a.m. – 9:00 p.m." }],
      menuUrl: "https://menupp.co/herencia/venue/E8SMLd1RmZ6WED4Vj18Y/menu/rKZWqhm61KrZyJfrQx4x",
      instagramUrl: "https://www.instagram.com/laherenciaco/",
      cover: `${U}/2024/07/20240711_160806_11zon-scaled.jpg`,
      gallery: [
        `${U}/2024/07/20240711_160806_11zon-scaled.jpg`,
        `${U}/2024/04/chuevo-1.jpg`,
        `${U}/2024/04/ensaladamanzana.jpg`,
        `${U}/2024/04/tabladequesos2.png`,
      ],
      tags: ["café", "origen", "desayunos"],
      faqs: [
        {
          q: "¿La Herencia abre para desayunar?",
          a: "Sí, abre todos los días desde las 8:00 a.m. con café de origen, desayunos y opciones para compartir.",
        },
      ],
    },
    {
      slug: "litany",
      name: "Litany",
      cat: "internacional",
      restaurant: true,
      short: "Cocina internacional de autor en un ambiente diseñado para quedarse.",
      long: "Litany propone una cocina internacional de autor: platos pensados para compartir, coctelería y un ambiente cuidado hasta el último detalle. El lugar para un almuerzo largo o una cena especial en Palmas Mall.",
      hours: [
        { days: "Lunes a jueves", hours: "12:00 m. – 3:00 p.m. · 6:00 p.m. – 10:00 p.m." },
        { days: "Viernes y sábado", hours: "12:00 m. – 11:00 p.m." },
        { days: "Domingos y festivos", hours: "12:00 m. – 5:00 p.m." },
      ],
      menuUrl: "https://litany.cluvi.co/litany/menu-digital/home",
      instagramUrl: "https://www.instagram.com/restaurantelitany/",
      cover: `${U}/2024/03/litany.webp`,
      gallery: [
        `${U}/2024/03/litany.webp`,
        `${U}/2024/03/419948039_18409943317009276_6621822275005841258_n.jpg`,
        `${U}/2024/03/420027499_18410301910009276_1411423683570895661_n.jpg`,
        `${U}/2024/03/420132851_18410301886009276_5047244459685547201_n.jpg`,
        `${U}/2024/03/428088409_18414785527009276_6647061937745729215_n.jpg`,
      ],
      tags: ["internacional", "cocina de autor"],
    },
    {
      slug: "tortelli",
      name: "Tortelli",
      cat: "internacional",
      restaurant: true,
      short: "Pasta fresca hecha en casa y cocina italiana contemporánea.",
      long: "En Tortelli la pasta se hace en casa todos los días: raviolis, tortellis y clásicos italianos con un toque contemporáneo. Un viaje a Italia sin salir del Food Hall de Palmas Mall.",
      hours: [
        { days: "Lunes a jueves", hours: "12:00 m. – 10:00 p.m." },
        { days: "Viernes", hours: "12:00 m. – 11:00 p.m." },
        { days: "Sábado", hours: "12:00 m. – 10:00 p.m." },
        { days: "Domingos y festivos", hours: "12:00 m. – 9:00 p.m." },
      ],
      facebookUrl: "https://www.facebook.com/restaurantetortelli",
      instagramUrl: "https://www.instagram.com/restaurantetortelli",
      tiktokUrl: "https://www.tiktok.com/@tortellirestaurante",
      cover: `${U}/2024/03/tortelli.webp`,
      gallery: [
        `${U}/2024/03/tortelli1.jpg`,
        `${U}/2024/03/tortelli2.jpg`,
        `${U}/2024/03/tortelli3.jpg`,
        `${U}/2024/03/tortelli4.jpg`,
        `${U}/2024/03/tortelli.webp`,
      ],
      tags: ["pasta", "italiana"],
    },
    {
      slug: "the-british-ale-house",
      name: "The British Ale House",
      cat: "cerveceria",
      restaurant: true,
      short: "Un pub británico en Cali: ales, cervezas importadas y ambiente de after office.",
      long: "The British Ale House trae a Palmas Mall el espíritu de los pubs británicos: ales artesanales, cervezas importadas y el mejor ambiente para el after office, ver el partido o alargar la noche con amigos.",
      instagramUrl: "https://www.instagram.com/the_british_ale_house",
      cover: `${U}/2025/05/img_2075-scaled.jpg`,
      gallery: [
        `${U}/2025/05/tbah1.jpg`,
        `${U}/2025/05/tbah2.jpg`,
        `${U}/2025/05/tbah3.jpg`,
        `${U}/2025/05/img_2075-scaled.jpg`,
      ],
      tags: ["pub", "cerveza", "bar"],
    },
    {
      slug: "momo-tea",
      name: "Momo Tea",
      cat: "postres",
      restaurant: true,
      short: "Bubble tea y bebidas de inspiración asiática preparadas al momento.",
      long: "Momo Tea es la parada dulce del mall: bubble tea, té de frutas y bebidas de inspiración asiática preparadas al momento, con toppings para armar la tuya. El plan refrescante para recorrer Palmas Mall.",
      websiteUrl: "https://linktr.ee/mimomotea",
      instagramUrl: "https://www.instagram.com/mimomotea",
      tiktokUrl: "https://www.tiktok.com/@mimomotea",
      cover: `${U}/2026/02/20260222_1205460.webp`,
      gallery: [
        `${U}/2026/02/20260222_1205460.webp`,
        `${U}/2000/01/phpa63hbe_maku-scaled.jpg`,
        `${U}/2000/01/phpobsiwy_baobao-fresa-scaled.jpg`,
        `${U}/2000/01/phpqmqeaz_bluberry-scaled.jpg`,
        `${U}/2000/01/phpswa1fs_miel-amor-scaled.jpg`,
      ],
      tags: ["bubble tea", "bebidas", "postres"],
    },
    {
      slug: "hakims-pastry",
      name: "Hakims' Pastry",
      cat: "postres",
      restaurant: true,
      placeholder: true,
      short: "Repostería artesanal: tortas, postres y dulces para celebrar cualquier momento.",
      long: PH + "Repostería artesanal hecha a mano: tortas, postres y dulces perfectos para acompañar un café o celebrar en familia en Palmas Mall.",
      tags: ["repostería", "postres", "dulces"],
    },
    {
      slug: "puma",
      name: "PUMA",
      cat: "deporte",
      short: "Sneakers, ropa deportiva y estilo urbano de una de las marcas líderes del mundo.",
      long: "La tienda oficial PUMA en Palmas Mall reúne lo mejor de la marca alemana: sneakers icónicos, ropa deportiva y colecciones urbanas para entrenar o para la calle. Encuentra los lanzamientos más recientes en Ciudad Jardín.",
      instagramUrl: "https://www.instagram.com/pumacolombia",
      cover: `${U}/2025/10/20251022_08574311.webp`,
      gallery: [
        `${U}/2025/10/20251022_08574311.webp`,
        `${U}/2025/09/15999081365033.jpg`,
        `${U}/2025/09/whatsapp-image-2026-06-19-at-14.05.24.jpeg`,
        `${U}/2025/09/whatsapp-image-2026-06-19-at-14.05.25.jpeg`,
      ],
      tags: ["deporte", "sneakers", "ropa"],
    },
    {
      slug: "new-balance",
      name: "New Balance",
      cat: "deporte",
      short: "Sneakers icónicos y tecnología premium para correr la ciudad con estilo.",
      long: "New Balance combina herencia deportiva y diseño contemporáneo: sneakers icónicos como los 574 y 990, ropa técnica y calzado de running con tecnología premium. Visita la tienda en Palmas Mall y encuentra tu par.",
      hours: [{ days: "Todos los días", hours: "10:00 a.m. – 8:00 p.m." }],
      websiteUrl: "https://www.newbalance.com.co/",
      facebookUrl: "https://www.facebook.com/NewBalanceColombia",
      instagramUrl: "https://www.instagram.com/newbalance/",
      cover: `${U}/2024/07/nb.jpg`,
      gallery: [
        `${U}/2024/07/nb.jpg`,
        `${U}/2024/07/16662_comp_f_image1.jpg`,
        `${U}/2024/07/16662_comp_f_image2.jpg`,
      ],
      tags: ["deporte", "sneakers", "running"],
    },
    {
      slug: "jagi",
      name: "Jagi",
      cat: "moda",
      short: "Gorras y accesorios con diseño propio para completar tu look.",
      long: "Jagi es la marca de gorras y accesorios con identidad propia: diseños originales, materiales de calidad y ediciones que se agotan rápido. Pasa por la tienda en Palmas Mall y encuentra la tuya.",
      websiteUrl: "https://jagicaps.com/",
      instagramUrl: "https://www.instagram.com/jagicaps",
      cover: `${U}/2024/03/img_3931-scaled-1.jpg`,
      gallery: [`${U}/2024/03/img_3931-scaled-1.jpg`],
      tags: ["gorras", "accesorios", "moda"],
    },
    {
      slug: "rafael-cure",
      name: "Rafael Cure",
      cat: "moda",
      short: "Sastrería y moda masculina de alta factura para las ocasiones que importan.",
      long: "Rafael Cure viste al hombre contemporáneo: sastrería a medida, blazers, trajes de matrimonio y prendas de alta factura. Una experiencia de moda masculina personalizada en Palmas Mall.",
      hours: [
        { days: "Lunes a sábado", hours: "10:00 a.m. – 7:00 p.m." },
        { days: "Domingos y festivos", hours: "10:00 a.m. – 5:00 p.m." },
      ],
      websiteUrl: "https://rafaelcure.com/",
      instagramUrl: "https://www.instagram.com/rafaelcuremen/",
      cover: `${U}/2024/07/imagen-de-whatsapp-2024-11-08-a-las-18.58.16_b74eaa06.jpg`,
      gallery: [
        `${U}/2024/07/blazer-venecia-azul-rey_01.jpg`,
        `${U}/2024/07/matrimonios-05-682x1024-1.jpg`,
        `${U}/2024/07/rafael-cure-etiqueta_02-682x1024-1.jpg`,
        `${U}/2024/07/rafael-cure-etiqueta_04-682x1024-1.jpg`,
        `${U}/2024/07/imagen-de-whatsapp-2024-11-08-a-las-18.58.16_b74eaa06.jpg`,
      ],
      tags: ["sastrería", "moda masculina", "trajes"],
    },
    {
      slug: "morea",
      name: "Morea",
      cat: "moda",
      comingSoon: true,
      placeholder: true,
      short: "Próximamente: una nueva experiencia de moda llega a Palmas Mall.",
      long: "Muy pronto Morea abrirá sus puertas en Palmas Mall. Síguenos en redes para enterarte de la apertura.",
      cover: `${U}/2026/03/morea.webp`,
      gallery: [`${U}/2026/03/morea.webp`],
      tags: ["moda", "próximamente"],
    },
    {
      slug: "toque-de-oro",
      name: "Toque de Oro",
      cat: "joyeria",
      short: "Joyería en oro de 18k: piezas para regalar o darte un gusto.",
      long: "Toque de Oro es la joyería de Palmas Mall: piezas en oro de 18 kilates, diseños clásicos y contemporáneos, y asesoría para encontrar el detalle perfecto para regalar o celebrar un momento especial.",
      hours: [{ days: "Todos los días", hours: "12:00 m. – 7:00 p.m." }],
      websiteUrl: "https://linkbio.co/VISITARWEB",
      instagramUrl: "https://www.instagram.com/toquedeoro18k/",
      cover: `${U}/2024/03/toque-de-oro-.webp`,
      gallery: [
        `${U}/2024/03/toque-de-oro-.webp`,
        `${U}/2024/03/428165473_1129762374641766_2986180703674440754_n.jpg`,
        `${U}/2024/03/428714607_1184623429170357_8877279495267229069_n.jpg`,
        `${U}/2024/03/428899345_2028207844229153_5931796351743813474_n.jpg`,
        `${U}/2024/03/429285944_1335342877128075_9170772517138491423_n.jpg`,
      ],
      tags: ["joyería", "oro 18k", "regalos"],
    },
    {
      slug: "milanelo",
      name: "Milanelo",
      cat: "moda",
      short: "Calzado y accesorios de inspiración italiana con carácter propio.",
      long: "Milanelo trae a Palmas Mall calzado y accesorios de inspiración italiana: diseño, materiales de calidad y piezas con carácter para elevar cualquier look.",
      hours: [
        { days: "Lunes a sábado", hours: "10:30 a.m. – 7:30 p.m." },
        { days: "Domingos y festivos", hours: "Cerrado" },
      ],
      websiteUrl: "https://milanelo.com/",
      facebookUrl: "https://www.facebook.com/milanelocol/",
      instagramUrl: "https://www.instagram.com/milanelo.oficial/",
      cover: `${U}/2024/03/milanelo-local.webp`,
      gallery: [
        `${U}/2024/03/milanelo-local.webp`,
        `${U}/2024/03/385870880_18387088096058145_5742222966063139010_n.jpg`,
        `${U}/2024/03/428646849_18412832584058145_8417798428380059905_n.jpg`,
        `${U}/2024/03/428658362_18418944547058145_4313289399378852220_n.jpg`,
        `${U}/2024/03/428663421_18414865423058145_4185828967990459873_n.jpg`,
      ],
      tags: ["calzado", "accesorios", "moda"],
    },
    {
      slug: "syn-lab",
      name: "SYNLAB",
      cat: "servicios",
      short: "Laboratorio clínico con estándares europeos: exámenes y resultados confiables.",
      long: "SYNLAB, la red de laboratorios clínicos líder en Europa, atiende en Palmas Mall: toma de muestras, exámenes de diagnóstico y resultados confiables sin salir del mall. Ideal para madrugar, hacerse el examen y desayunar en el Food Hall.",
      hours: [
        { days: "Lunes a viernes", hours: "6:00 a.m. – 12:00 m. · 1:00 p.m. – 3:00 p.m." },
        { days: "Sábado", hours: "6:00 a.m. – 12:00 m." },
        { days: "Domingos y festivos", hours: "Cerrado" },
      ],
      websiteUrl: "https://www.synlab.co/",
      facebookUrl: "https://www.facebook.com/SYNLABColombia/",
      instagramUrl: "https://www.instagram.com/synlab_colombia/",
      cover: `${U}/2024/03/synlab-laboratorio-clinico.webp`,
      gallery: [
        `${U}/2024/03/synlab-laboratorio-clinico.webp`,
        `${U}/2024/03/323463796_1097869611613622_6200241308504023855_n.jpg`,
        `${U}/2024/03/327759296_1799025057216494_4703763550790091772_n.jpg`,
      ],
      tags: ["laboratorio", "salud", "servicios"],
    },
  ];

  for (const [i, l] of locales.entries()) {
    const data = {
      name: l.name,
      categoryId: catId[l.cat],
      sedeId: cali.id,
      shortDescription: l.short,
      longDescription: l.long,
      openingHours: l.hours ?? [],
      unitNumber: l.unit ?? "",
      menuUrl: l.menuUrl ?? "",
      deliveryUrl: l.deliveryUrl ?? "",
      websiteUrl: l.websiteUrl ?? "",
      instagramUrl: l.instagramUrl ?? "",
      facebookUrl: l.facebookUrl ?? "",
      tiktokUrl: l.tiktokUrl ?? "",
      coverUrl: LOCAL_MEDIA[l.slug]?.cover || l.cover || "",
      gallery: LOCAL_MEDIA[l.slug]?.gallery ?? l.gallery ?? [],
      tags: l.tags ?? [],
      isRestaurant: l.restaurant ?? false,
      featured: l.featured ?? false,
      comingSoon: l.comingSoon ?? false,
      isPlaceholder: l.placeholder ?? false,
      order: i,
      status: ContentStatus.PUBLISHED,
      seoTitle: `${l.name} en Palmas Mall Cali`,
      seoDescription: l.short,
    };
    const local = await prisma.local.upsert({
      where: { slug: l.slug },
      update: data,
      create: { slug: l.slug, ...data },
    });

    if (l.faqs?.length) {
      const existing = await prisma.faq.count({ where: { localId: local.id } });
      if (existing === 0) {
        await prisma.faq.createMany({
          data: l.faqs.map((f, j) => ({
            scope: FaqScope.LOCAL,
            localId: local.id,
            question: f.q,
            answer: f.a,
            order: j,
          })),
        });
      }
    }
  }
  console.log(`  ✓ ${locales.length} locales (galerías y links reales)`);

  // ── Eventos (demo, marcados como placeholder) ───────────────
  const now = new Date();
  const inDays = (d: number, h = 18) => {
    const x = new Date(now);
    x.setDate(x.getDate() + d);
    x.setHours(h, 0, 0, 0);
    return x;
  };

  const events = [
    {
      slug: "viernes-de-cocteles-2x1",
      title: "Viernes de cócteles 2x1",
      short: "Todos los viernes, cócteles 2x1 en los restaurantes y bares participantes del Food Hall.",
      long: "<p>Cada viernes el Food Hall de Palmas Mall se convierte en el mejor plan de la ciudad: cócteles 2x1 en los restaurantes y bares participantes, música y el ambiente de nuestra arquitectura a cielo abierto.</p><p>Llega temprano, elige tu mesa favorita y deja que los meseros de las distintas plazas te atiendan en un solo lugar.</p>",
      startsAt: inDays(3, 17),
      endsAt: inDays(3, 23),
      timeLabel: "5:00 p.m. – 11:00 p.m.",
      location: "Food Hall",
      featured: true,
      cover: "/images/galeria/20241229_020127780_ios-scaled.webp",
    },
    {
      slug: "feria-market-palmas-mall",
      title: "Feria Market Palmas Mall",
      short: "Emprendedores locales, moda, diseño y sabores en una feria para toda la familia.",
      long: "<p>La Feria Market reúne a los mejores emprendedores locales: moda, diseño, accesorios, bienestar y sabores, en los corredores a cielo abierto de Palmas Mall.</p><p>Un plan para venir en familia, con tu mascota, y descubrir marcas nuevas mientras disfrutas la mejor gastronomía de la ciudad.</p>",
      startsAt: inDays(10, 11),
      endsAt: inDays(12, 20),
      timeLabel: "11:00 a.m. – 8:00 p.m.",
      location: "Corredores y plazoletas",
      featured: true,
      cover: "/images/galeria/dsc1563-scaled.webp",
    },
    {
      slug: "futbol-en-pantalla-gigante",
      title: "Fútbol en pantalla gigante",
      short: "Vive los partidos de la Selección Colombia en pantalla gigante con la mejor gastronomía.",
      long: "<p>Los mejores campeonatos del fútbol se viven en Palmas Mall. Disfruta los partidos de la Selección Colombia en pantalla gigante, acompañado de la mejor oferta gastronómica del Food Hall.</p><p>¡Ven a apoyar a la Selección y vive tus mejores momentos con nosotros!</p>",
      startsAt: inDays(17, 15),
      endsAt: inDays(17, 18),
      timeLabel: "3:00 p.m.",
      location: "Food Hall · pantalla principal",
      featured: false,
      cover: "/images/galeria/dsc2143-scaled.webp",
    },
  ];

  const seededEventIds: string[] = [];
  for (const e of events) {
    const ev = await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        slug: e.slug,
        title: e.title,
        shortDescription: e.short,
        longDescription: e.long,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        timeLabel: e.timeLabel,
        location: e.location,
        coverUrl: e.cover,
        featured: e.featured,
        status: ContentStatus.PUBLISHED,
        isPlaceholder: true,
        sedeId: cali.id,
        organizer: "Palmas Mall",
        seoTitle: `${e.title} | Eventos Palmas Mall`,
        seoDescription: e.short,
      },
    });
    seededEventIds.push(ev.id);
  }
  console.log(`  ✓ ${events.length} eventos demo`);

  // ── Blog (demo, marcados como placeholder) ──────────────────
  const posts = [
    {
      slug: "que-es-un-lifestyle-mall",
      title: "¿Qué es un Lifestyle Mall y por qué Palmas Mall fue el primero de Colombia?",
      category: "Palmas Mall",
      excerpt:
        "Palmas Mall trajo a Colombia el concepto de Lifestyle Mall: un centro comercial a cielo abierto, cerca de las mejores zonas residenciales, diseñado alrededor de las experiencias.",
      content:
        "<p>Palmas Mall trajo a Colombia el concepto de arquitectura comercial conocido como <strong>Lifestyle Mall</strong>: un centro comercial que se implanta cerca de las mejores zonas residenciales de la ciudad para atender y sorprender a sus exigentes residentes.</p><h2>Arquitectura que crea experiencias</h2><p>A diferencia de un centro comercial tradicional, un Lifestyle Mall se diseña a cielo abierto, envuelto en vegetación, con espacios que invitan a quedarse: terrazas, plazoletas, zonas petfriendly y una oferta gastronómica a la mesa.</p><h2>Tus mejores momentos</h2><p>Esa filosofía se resume en nuestro slogan: que cada visita sea uno de tus mejores momentos. Por eso Palmas Mall ha sido galardonado por FIABCI y por el ICSC con el Silver Award a la excelencia en diseño y desarrollo.</p>",
      cover: "/images/galeria/shopping-cali2.webp",
      featured: true,
    },
    {
      slug: "guia-food-hall-palmas-mall",
      title: "Guía del Food Hall: qué comer en Palmas Mall",
      category: "Food & Drinks",
      excerpt:
        "Del sushi de Takamar a la parrilla de Leños & Carbón: una guía rápida para comer delicioso en el Food Hall de Palmas Mall.",
      content:
        "<p>El Food Hall de Palmas Mall es único en el país: distintas plazas se unen ofreciendo un mix de restaurantes seleccionados con diversas corrientes gastronómicas, todo <strong>a la mesa</strong>.</p><h2>Para empezar</h2><p>Un café de origen en La Herencia by Mujeres Cafeteras o un bubble tea de Momo Tea.</p><h2>Platos fuertes</h2><p>Sushi de Takamar, parrilla de Leños & Carbón, pizza al horno de barro de Viva L'Italia, pasta fresca de Tortelli o la fusión peruano-colombiana de Entre Costas.</p><h2>Para cerrar</h2><p>Un postre de Crepes & Waffles y una cerveza artesanal en BBC o The British Ale House.</p>",
      cover: "/images/galeria/20241229_020127780_ios-scaled.webp",
      featured: true,
    },
    {
      slug: "playzone-molly-plan-familiar",
      title: "PlayZone y Molly: el plan favorito de los niños en Palmas Mall",
      category: "Familia",
      excerpt:
        "Conoce PlayZone, la zona de juegos de Palmas Mall, y a Molly, la palmera amigable que recibe a los más pequeños.",
      content:
        "<p>En Palmas Mall los niños tienen su propio universo: <strong>PlayZone</strong>, una zona de juegos segura y divertida donde Molly, nuestra palmera amigable, es la anfitriona.</p><p>Mientras los pequeños juegan, los grandes disfrutan del Food Hall, las tiendas o un café. Un plan redondo para toda la familia, todos los días.</p>",
      cover: "/images/galeria/dsc1699-1-scaled.webp",
      featured: false,
    },
  ];

  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        excerpt: p.excerpt,
        content: p.content,
        coverUrl: p.cover,
        featured: p.featured,
        status: ContentStatus.PUBLISHED,
        isPlaceholder: true,
        author: "Palmas Mall",
        seoTitle: p.title,
        seoDescription: p.excerpt,
      },
    });
  }
  console.log(`  ✓ ${posts.length} posts demo`);

  // ── Galería "Momentos Palmas Mall" ──────────────────────────
  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "momentos-palmas-mall" },
    update: {},
    create: {
      slug: "momentos-palmas-mall",
      title: "Momentos Palmas Mall",
      description: "Ferias, eventos, gastronomía y arquitectura: así se viven los mejores momentos.",
      order: 0,
    },
  });

  const galleryImages: { file: string; alt: string; home?: boolean }[] = [
    { file: "dsc1563-scaled.webp", alt: "Feria Market en los corredores a cielo abierto de Palmas Mall", home: true },
    { file: "dsc1638-scaled.webp", alt: "Visitantes recorriendo la Feria Market de Palmas Mall", home: true },
    { file: "dsc1699-1-scaled.webp", alt: "Familias disfrutando un evento en Palmas Mall", home: true },
    { file: "dsc1837-scaled.webp", alt: "Desfile de moda en Palmas Mall Cali", home: true },
    { file: "dsc2143-scaled.webp", alt: "Evento con público en la plazoleta central de Palmas Mall", home: true },
    { file: "dsc2168-scaled.webp", alt: "Ambiente de tarde en las terrazas de Palmas Mall" },
    { file: "20241229_020127780_ios-scaled.webp", alt: "Food Hall de Palmas Mall iluminado en la noche", home: true },
    { file: "20241229_021012195_ios-scaled.webp", alt: "Decoración navideña nocturna en Palmas Mall" },
    { file: "20241230_014309000_ios-1-scaled.webp", alt: "Luces de navidad en los jardines de Palmas Mall", home: true },
    { file: "20250119_193238112_ios-scaled.webp", alt: "Atardecer en la arquitectura a cielo abierto de Palmas Mall", home: true },
    { file: "shopping-cali2.webp", alt: "Panorámica de Palmas Mall, lifestyle mall en Cali" },
    { file: "fmodelreescalada.webp", alt: "Experiencia de compras y moda en Palmas Mall" },
  ];

  const existingImages = await prisma.galleryImage.count();
  if (existingImages === 0) {
    for (const [i, g] of galleryImages.entries()) {
      await prisma.galleryImage.create({
        data: {
          albumId: album.id,
          url: `/images/galeria/${g.file}`,
          alt: g.alt,
          showOnHome: g.home ?? false,
          order: i,
        },
      });
    }
  }
  console.log(`  ✓ ${galleryImages.length} imágenes de galería`);

  // ── FAQs globales (AEO) ─────────────────────────────────────
  const faqs: { q: string; a: string }[] = [
    {
      q: "¿Qué es Palmas Mall?",
      a: "Palmas Mall es un Lifestyle Mall: un centro comercial a cielo abierto que trajo a Colombia este concepto de arquitectura comercial. Reúne el mejor Food Hall de Cali, tiendas exclusivas, eventos, coworking y espacios petfriendly alrededor de una filosofía: que vivas tus mejores momentos.",
    },
    {
      q: "¿Dónde queda Palmas Mall?",
      a: "Palmas Mall está en Cali, Colombia: Carrera 105 No. 15-09, en Ciudad Jardín, en el corazón de la Milla de Oro, cerca de las mejores zonas residenciales del sur de la ciudad.",
    },
    {
      q: "¿Qué restaurantes hay en Palmas Mall?",
      a: "El Food Hall reúne restaurantes como Takamar (sushi), Leños & Carbón (parrilla), Crepes & Waffles To Go, Viva L'Italia (pizza), Tortelli (pasta), Entre Costas (fusión peruano-colombiana), Litany, Hamburgo, La Herencia by Mujeres Cafeteras (café), Momo Tea, BBC Cervecería y The British Ale House.",
    },
    {
      q: "¿Qué tiendas hay en Palmas Mall?",
      a: "Encuentras marcas como PUMA, New Balance, Rafael Cure, Jagi, Milanelo, Toque de Oro (joyería) y servicios como SYNLAB (laboratorio clínico), entre otras. Consulta el directorio completo en la sección Locales.",
    },
    {
      q: "¿Palmas Mall es petfriendly?",
      a: "Sí. Palmas Mall es un mall petfriendly: puedes visitarnos con tu mascota y disfrutar juntos de los espacios a cielo abierto, las terrazas y los jardines.",
    },
    {
      q: "¿Cómo llegar a Palmas Mall?",
      a: "Estamos en la Carrera 105 No. 15-09, Ciudad Jardín, al sur de Cali. Puedes llegar en carro (contamos con parqueadero), en taxi o apps de transporte. Usa el botón de Waze o Google Maps en la sección Cómo llegar para navegación paso a paso.",
    },
    {
      q: "¿Qué eventos hay en Palmas Mall?",
      a: "Cada semana hay planes distintos: viernes de cócteles, ferias de emprendedores, eventos deportivos en pantalla gigante, actividades familiares y celebraciones de temporada. Revisa la agenda actualizada en la sección Eventos.",
    },
    {
      q: "¿Palmas Mall tiene food hall?",
      a: "Sí, y es único en el país: distintas plazas gastronómicas se articulan para ofrecer un mix de restaurantes seleccionados con servicio a la mesa, en una arquitectura a cielo abierto rodeada de vegetación, ideal para disfrutar la corriente slow food.",
    },
    {
      q: "¿Cómo contactar a Palmas Mall?",
      a: "Escríbenos por WhatsApp al +57 315 284 2989, al correo palmasmall@palmasmall.com, o usa el formulario de la página de Contacto para peticiones, quejas, reclamos o sugerencias.",
    },
    {
      q: "¿Cómo alquilar o patrocinar un espacio en Palmas Mall?",
      a: "Si quieres que tu marca haga parte de Palmas Mall (local comercial, patrocinio o activación), visita la sección Be Our Sponsors y déjanos tus datos: nuestro equipo comercial te contactará.",
    },
  ];

  const existingFaqs = await prisma.faq.count({ where: { scope: FaqScope.GLOBAL } });
  if (existingFaqs === 0) {
    for (const [i, f] of faqs.entries()) {
      await prisma.faq.create({
        data: { scope: FaqScope.GLOBAL, question: f.q, answer: f.a, order: i },
      });
    }
  } else {
    // Actualiza la respuesta de "¿Dónde queda?" si venía con Barranquilla
    await prisma.faq.updateMany({
      where: { scope: FaqScope.GLOBAL, question: "¿Dónde queda Palmas Mall?" },
      data: {
        answer:
          "Palmas Mall está en Cali, Colombia: Carrera 105 No. 15-09, en Ciudad Jardín, en el corazón de la Milla de Oro, cerca de las mejores zonas residenciales del sur de la ciudad.",
      },
    });
  }
  console.log(`  ✓ ${faqs.length} FAQs globales (AEO)`);

  // ── Páginas del sitio (SEO + FAQs editables) ────────────────
  const pages: { slug: string; title: string; description: string; seoTitle: string; seoDescription: string }[] = [
    {
      slug: "home",
      title: "Inicio",
      description: "Página principal",
      seoTitle: "Palmas Mall · Lifestyle Mall en Cali | Tus mejores momentos",
      seoDescription:
        "Palmas Mall es un Lifestyle Mall en Cali con el mejor Food Hall de la ciudad, tiendas exclusivas, eventos, coworking y espacios petfriendly. Vive tus mejores momentos.",
    },
    {
      slug: "conoce-palmas-mall",
      title: "Conoce Palmas Mall",
      description: "Quiénes somos, el concepto Lifestyle Mall y nuestra historia",
      seoTitle: "Conoce Palmas Mall: el primer Lifestyle Mall de Colombia",
      seoDescription:
        "Palmas Mall trajo a Colombia el concepto de Lifestyle Mall: arquitectura a cielo abierto, experiencias gastronómicas y espacios diseñados para vivir tus mejores momentos.",
    },
    {
      slug: "food-drinks",
      title: "Food & Drinks",
      description: "El Food Hall y la experiencia gastronómica",
      seoTitle: "Food & Drinks: el mejor Food Hall de Cali",
      seoDescription:
        "Vive la experiencia gourmet de Palmas Mall: un Food Hall único en Colombia con restaurantes seleccionados, servicio a la mesa y arquitectura a cielo abierto.",
    },
    {
      slug: "shop-more",
      title: "Shop & More",
      description: "Tiendas, moda y servicios",
      seoTitle: "Shop & More: tiendas y marcas en Palmas Mall",
      seoDescription:
        "Boutiques exclusivas, concept stores, deporte, joyería y servicios en Palmas Mall Cali. Explora tendencias globales donde la moda cobra vida.",
    },
    {
      slug: "galardones",
      title: "Galardones",
      description: "Premios FIABCI e ICSC Silver Award",
      seoTitle: "Galardones de Palmas Mall: FIABCI e ICSC Silver Award",
      seoDescription:
        "Palmas Mall ha sido premiado por FIABCI (excelencia inmobiliaria) y por el ICSC con el Silver Award 2009 a la excelencia en diseño y desarrollo de nuevos proyectos.",
    },
    {
      slug: "patrocinios",
      title: "Be Our Sponsors",
      description: "Patrocinios y espacios comerciales",
      seoTitle: "Be Our Sponsors: tu marca en Palmas Mall",
      seoDescription:
        "La mejor ubicación para tu marca: locales comerciales, patrocinios y activaciones en Palmas Mall, el Lifestyle Mall de Cali. Contáctanos.",
    },
    {
      slug: "plano-del-mall",
      title: "Plano del Mall",
      description: "Mapa y ubicación de los locales",
      seoTitle: "Plano del Mall: encuentra cada local en Palmas Mall",
      seoDescription:
        "Consulta el plano de Palmas Mall Cali y encuentra fácilmente restaurantes, tiendas y servicios dentro del mall.",
    },
    {
      slug: "como-llegar",
      title: "Cómo llegar",
      description: "Direcciones, Waze, Google Maps y horarios",
      seoTitle: "Cómo llegar a Palmas Mall en Cali",
      seoDescription:
        "Palmas Mall queda en la Carrera 105 No. 15-09, Ciudad Jardín, Cali. Llega fácil con Waze o Google Maps, en carro o transporte público. Horarios y parqueadero.",
    },
    {
      slug: "contacto",
      title: "Contáctanos",
      description: "Formulario PQRS y datos de contacto",
      seoTitle: "Contacto: escríbenos a Palmas Mall",
      seoDescription:
        "En Palmas Mall estamos siempre dispuestos a escucharte. Escríbenos por WhatsApp, correo o el formulario de peticiones, quejas y sugerencias.",
    },
    {
      slug: "momentos-palmas-mall",
      title: "Momentos Palmas Mall",
      description: "Galería de fotos y momentos",
      seoTitle: "Momentos Palmas Mall: galería de experiencias",
      seoDescription:
        "Ferias, eventos, gastronomía, moda y arquitectura: revive los mejores momentos de Palmas Mall en nuestra galería.",
    },
    {
      slug: "politica-tratamiento-datos",
      title: "Política de tratamiento de datos",
      description: "Política de privacidad y protección de datos personales",
      seoTitle: "Política de tratamiento de datos personales",
      seoDescription:
        "Conoce la política de tratamiento de datos personales de Palmas Mall, conforme a la Ley 1581 de 2012 de Colombia.",
    },
    {
      slug: "eventos",
      title: "Eventos",
      description: "Agenda de eventos y experiencias",
      seoTitle: "Eventos en Palmas Mall: agenda y experiencias",
      seoDescription:
        "Ferias, conciertos, planes familiares, fútbol en pantalla gigante y más. Consulta la agenda de eventos de Palmas Mall Cali.",
    },
    {
      slug: "directorio",
      title: "Directorio",
      description: "Todos los restaurantes, tiendas y servicios",
      seoTitle: "Directorio de locales de Palmas Mall Cali",
      seoDescription:
        "Explora todos los locales de Palmas Mall: restaurantes del Food Hall, tiendas de moda, deporte, joyería y servicios. Encuentra cada local en el plano.",
    },
    {
      slug: "blog",
      title: "Blog y noticias",
      description: "Novedades, guías y noticias del mall",
      seoTitle: "Blog de Palmas Mall: noticias y guías",
      seoDescription:
        "Novedades, guías gastronómicas, eventos y todo lo que pasa en Palmas Mall, el Lifestyle Mall de Cali.",
    },
    {
      slug: "play-zone",
      title: "PlayZone",
      description: "La zona de juegos para niños de Palmas Mall",
      seoTitle: "PlayZone Palmas Mall: la zona de juegos para niños en Cali",
      seoDescription:
        "PlayZone es la zona de juegos de Palmas Mall en Cali: un espacio seguro y divertido para los niños mientras la familia disfruta el Lifestyle Mall.",
    },
  ];

  const pageId: Record<string, string> = {};
  for (const p of pages) {
    const page = await prisma.page.upsert({
      where: { slug: p.slug },
      update: { seoTitle: p.seoTitle, seoDescription: p.seoDescription },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        status: ContentStatus.PUBLISHED,
        system: true,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      },
    });
    pageId[p.slug] = page.id;
  }
  console.log(`  ✓ ${pages.length} páginas`);

  // Bloques editables del home (hero + textos clave)
  const homeBlocks = await prisma.pageBlock.count({ where: { pageId: pageId["home"] } });
  if (homeBlocks === 0) {
    await prisma.pageBlock.createMany({
      data: [
        {
          pageId: pageId["home"],
          type: BlockType.HERO,
          order: 0,
          data: {
            heading: "Vive tus mejores momentos",
            subheading:
              "Gastronomía, compras, eventos y arquitectura a cielo abierto en el corazón de la Milla de Oro, Cali.",
            imageUrl: "/images/galeria/20250119_193238112_ios-scaled.webp",
            ctaPrimaryLabel: "Explorar el directorio",
            ctaPrimaryUrl: "/directorio",
            ctaSecondaryLabel: "Cómo llegar",
            ctaSecondaryUrl: "/como-llegar",
          },
        },
        {
          pageId: pageId["home"],
          type: BlockType.RICH_TEXT,
          order: 1,
          data: {
            key: "intro",
            heading: "Mucho más que un centro comercial",
            body: "Palmas Mall trajo a Colombia el concepto de Lifestyle Mall: arquitectura a cielo abierto, rodeada de vegetación, con el mejor Food Hall de Cali, tiendas exclusivas, coworking, espacios petfriendly y eventos para toda la familia.",
          },
        },
      ],
    });
  }

  // Bloques HERO editables de páginas de sistema (título/subtítulo/imagen de cabecera).
  // Los textos replican el diseño actual; el admin puede cambiarlos desde Páginas.
  const heroDefaults: Record<string, { heading: string; subheading: string; imageUrl?: string }> = {
    "conoce-palmas-mall": {
      heading: "Conoce Palmas Mall",
      subheading:
        "El primer Lifestyle Mall de Colombia: un lugar diseñado para vivir la ciudad de otra manera.",
    },
    "food-drinks": {
      heading: "El mejor Food Hall de Cali",
      subheading:
        "Restaurantes seleccionados, servicio a la mesa y una arquitectura a cielo abierto hecha para el slow food.",
      imageUrl: "/images/galeria/20241229_020127780_ios-scaled.webp",
    },
    "shop-more": {
      heading: "Donde la moda cobra vida",
      subheading:
        "Boutiques exclusivas, concept stores y servicios seleccionados para una experiencia de compra única.",
      imageUrl: "/images/galeria/dsc1837-scaled.webp",
    },
    galardones: {
      heading: "Un diseño reconocido en el mundo",
      subheading:
        "La arquitectura y el concepto de Palmas Mall han sido premiados por las organizaciones más importantes del sector inmobiliario y de centros comerciales a nivel internacional.",
    },
    patrocinios: {
      heading: "Be Our Sponsors",
      subheading: "La mejor ubicación para tu marca: haz parte del Lifestyle Mall de Cali.",
    },
    "plano-del-mall": {
      heading: "Plano del Mall",
      subheading: "Ubica restaurantes, tiendas y servicios dentro de Palmas Mall.",
    },
    "como-llegar": {
      heading: "Cómo llegar",
      subheading: "Estamos en el corazón de la Milla de Oro, Ciudad Jardín. Abre la navegación y ven a vivir tus mejores momentos.",
    },
    contacto: {
      heading: "Contáctanos",
      subheading:
        "En Palmas Mall estamos siempre dispuestos a escucharte: escríbenos si tienes dudas o inquietudes sobre nuestros locales y servicios.",
    },
    "momentos-palmas-mall": {
      heading: "Momentos Palmas Mall",
      subheading:
        "Ferias, gastronomía, moda, familia y noches inolvidables: toca cualquier foto para verla en grande.",
    },
    "politica-tratamiento-datos": {
      heading: "Política de tratamiento de datos",
      subheading: "",
    },
    eventos: {
      heading: "Eventos",
      subheading:
        "Ferias, música, deporte y planes para toda la familia: esto es lo que viene en Palmas Mall.",
    },
    directorio: {
      heading: "Directorio",
      subheading: "Restaurantes, tiendas y servicios: todo lo que puedes encontrar en Palmas Mall.",
    },
    "play-zone": {
      heading: "PlayZone",
      subheading: "La zona de juegos donde los peques viven Palmas Mall a su manera.",
    },
    blog: {
      heading: "Blog y noticias",
      subheading: "Guías, novedades y todo lo que está pasando en Palmas Mall.",
    },
  };
  for (const [slug, data] of Object.entries(heroDefaults)) {
    const existing = await prisma.pageBlock.count({
      where: { pageId: pageId[slug], type: BlockType.HERO },
    });
    if (existing === 0) {
      await prisma.pageBlock.create({
        data: { pageId: pageId[slug], type: BlockType.HERO, order: 0, data },
      });
    }
  }
  console.log(`  ✓ bloques HERO de páginas de sistema`);

  // Bloque RICH_TEXT con la política de tratamiento de datos (editable en admin).
  const policyBlocks = await prisma.pageBlock.count({
    where: { pageId: pageId["politica-tratamiento-datos"], type: BlockType.RICH_TEXT },
  });
  if (policyBlocks === 0) {
    await prisma.pageBlock.create({
      data: {
        pageId: pageId["politica-tratamiento-datos"],
        type: BlockType.RICH_TEXT,
        order: 1,
        data: { key: "policy", body: POLICY_HTML },
      },
    });
  }

  // PlayZone: video (editable) + texto de intro.
  const playzoneBlocks = await prisma.pageBlock.count({
    where: { pageId: pageId["play-zone"], type: { in: [BlockType.VIDEO, BlockType.RICH_TEXT] } },
  });
  if (playzoneBlocks === 0) {
    await prisma.pageBlock.createMany({
      data: [
        {
          pageId: pageId["play-zone"],
          type: BlockType.RICH_TEXT,
          order: 1,
          data: {
            key: "intro",
            heading: "Diversión para los más pequeños",
            body: "PlayZone es el rincón favorito de los niños en Palmas Mall: un espacio seguro y lleno de color para jugar y crear recuerdos, mientras la familia disfruta del Food Hall, las tiendas y la arquitectura a cielo abierto. Un plan redondo para venir en familia, todos los días.",
          },
        },
        {
          pageId: pageId["play-zone"],
          type: BlockType.VIDEO,
          order: 2,
          data: {
            heading: "PlayZone en Palmas Mall",
            url: CLOUDINARY.playzoneVideo,
          },
        },
      ],
    });
  }

  // ── FAQs por página (AEO) ───────────────────────────────────
  // Estas son las respuestas que citan Google AI Overviews, ChatGPT y
  // Perplexity. Cada una alimenta el JSON-LD FAQPage de su página.
  const pageFaqs: Record<string, { question: string; answer: string }[]> = {
    "como-llegar": [
      {
        question: "¿Palmas Mall tiene parqueadero?",
        answer: "Sí, contamos con parqueadero para carros y motos dentro del mall.",
      },
      {
        question: "¿Puedo llegar en transporte público?",
        answer:
          "Sí. Palmas Mall está en Ciudad Jardín, al sur de Cali, con acceso por la Carrera 105. También puedes llegar fácil en taxi o apps de transporte.",
      },
      {
        question: "¿Dónde queda Palmas Mall en Cali?",
        answer:
          "Palmas Mall está en la Carrera 105 No. 15-09, barrio Ciudad Jardín, al sur de Cali, en el corazón de la Milla de Oro.",
      },
    ],
    "food-drinks": [
      {
        question: "¿Qué restaurantes hay en Palmas Mall?",
        answer:
          "El Food Hall de Palmas Mall reúne restaurantes de parrilla, hamburguesas, cocina internacional, postres, cafés y cervecería. Puedes ver el listado completo en el directorio de locales.",
      },
      {
        question: "¿Cómo funciona el Food Hall de Palmas Mall?",
        answer:
          "Es un Food Hall único en Colombia: distintas plazas gastronómicas se articulan en un solo espacio y el servicio es a la mesa. A tu mesa pueden llegar platos de uno o de varios restaurantes, atendidos por sus propios meseros.",
      },
      {
        question: "¿Necesito reservar para comer en Palmas Mall?",
        answer:
          "No es obligatorio. Algunos restaurantes aceptan reservas por WhatsApp o por su página web; encuentras sus datos de contacto en la ficha de cada local.",
      },
    ],
    "shop-more": [
      {
        question: "¿Qué tiendas hay en Palmas Mall?",
        answer:
          "Palmas Mall tiene boutiques de moda, concept stores, deporte, joyería, salud y belleza, entretenimiento y servicios. Consulta el directorio de locales para ver todas las marcas.",
      },
      {
        question: "¿Palmas Mall tiene servicios además de tiendas?",
        answer:
          "Sí. Además de moda y retail, encuentras servicios que te simplifican el día, coworking y zonas para trabajar o reunirte rodeado de vegetación.",
      },
    ],
    eventos: [
      {
        question: "¿Qué eventos hay en Palmas Mall?",
        answer:
          "Palmas Mall programa ferias, música en vivo, planes familiares, transmisiones deportivas y activaciones de marca durante todo el año. La agenda actualizada está en la página de Eventos.",
      },
      {
        question: "¿Los eventos de Palmas Mall son gratuitos?",
        answer:
          "La mayoría de los eventos son de entrada libre. Cuando un evento tiene costo o requiere registro, se indica en su ficha.",
      },
    ],
    "plano-del-mall": [
      {
        question: "¿Cómo encuentro un local dentro de Palmas Mall?",
        answer:
          "Puedes consultar el plano del mall para ubicar restaurantes, tiendas y servicios, o buscar el local por nombre o categoría en el directorio.",
      },
    ],
    contacto: [
      {
        question: "¿Cómo contacto a Palmas Mall?",
        answer:
          "Puedes escribirnos por WhatsApp, enviarnos un correo o usar el formulario de peticiones, quejas y sugerencias (PQRS) en la página de Contacto.",
      },
      {
        question: "¿Cuál es el horario de Palmas Mall?",
        answer:
          "Consulta el horario vigente en la página de Cómo llegar. Los horarios de cada restaurante o tienda pueden variar y se indican en la ficha del local.",
      },
    ],
    patrocinios: [
      {
        question: "¿Cómo puedo poner un local o marca en Palmas Mall?",
        answer:
          "Ofrecemos locales comerciales, patrocinios, activaciones de marca, eventos y publicidad dentro del mall. Escríbenos desde la página Be Our Sponsors y te contactamos.",
      },
    ],
    "momentos-palmas-mall": [
      {
        question: "¿Palmas Mall es petfriendly?",
        answer:
          "Sí. Tu mascota es bienvenida en los corredores, jardines y terrazas a cielo abierto del mall.",
      },
    ],
    galardones: [
      {
        question: "¿Qué premios ha ganado Palmas Mall?",
        answer:
          "Palmas Mall recibió el premio nacional de FIABCI a la excelencia inmobiliaria en la categoría comercio, y el Silver Award 2009 del ICSC (International Council of Shopping Centers) en la categoría Innovative Design and Development of a New Project.",
      },
    ],
    blog: [
      {
        question: "¿Dónde encuentro novedades de Palmas Mall?",
        answer:
          "En el blog publicamos guías gastronómicas, novedades de locales, eventos y todo lo que está pasando en el mall.",
      },
    ],
    directorio: [
      {
        question: "¿Cuántos locales tiene Palmas Mall?",
        answer:
          "El directorio reúne todos los restaurantes, tiendas y servicios del mall. Encuéntralos en el plano o búscalos por nombre.",
      },
    ],
    "play-zone": [
      {
        question: "¿Qué es el PlayZone de Palmas Mall?",
        answer:
          "El PlayZone es la zona de juegos de Palmas Mall pensada para los niños: un espacio seguro y divertido para que los peques disfruten mientras la familia vive el mall.",
      },
    ],
  };

  let pageFaqCount = 0;
  for (const [slug, faqList] of Object.entries(pageFaqs)) {
    const existing = await prisma.faq.count({ where: { pageId: pageId[slug] } });
    if (existing > 0) continue;
    await prisma.faq.createMany({
      data: faqList.map((f, i) => ({
        scope: FaqScope.PAGE,
        pageId: pageId[slug],
        question: f.question,
        answer: f.answer,
        order: i,
      })),
    });
    pageFaqCount += faqList.length;
  }
  console.log(`  ✓ ${pageFaqCount} FAQs por página (AEO)`);

  // ── Navegación ──────────────────────────────────────────────
  const mainMenu = await prisma.navigationMenu.upsert({
    where: { key: "main" },
    update: {},
    create: { key: "main", name: "Menú principal" },
  });
  const footerMenu = await prisma.navigationMenu.upsert({
    where: { key: "footer" },
    update: {},
    create: { key: "footer", name: "Footer" },
  });

  const mainItems = await prisma.navigationItem.count({ where: { menuId: mainMenu.id } });
  if (mainItems === 0) {
    await prisma.navigationItem.createMany({
      data: [
        { menuId: mainMenu.id, label: "Conoce Palmas Mall", url: "/conoce-palmas-mall", order: 0 },
        { menuId: mainMenu.id, label: "Directorio", url: "/directorio", order: 1 },
        { menuId: mainMenu.id, label: "Eventos", url: "/eventos", order: 2 },
        { menuId: mainMenu.id, label: "Cómo llegar", url: "/como-llegar", order: 3 },
        { menuId: mainMenu.id, label: "Momentos", url: "/momentos-palmas-mall", order: 4 },
        { menuId: mainMenu.id, label: "Plano", url: "/plano-del-mall", order: 5 },
        { menuId: mainMenu.id, label: "Be Our Sponsors", url: "/patrocinios", order: 6 },
      ],
    });
  }

  const footerItems = await prisma.navigationItem.count({ where: { menuId: footerMenu.id } });
  if (footerItems === 0) {
    await prisma.navigationItem.createMany({
      data: [
        { menuId: footerMenu.id, label: "Conoce Palmas Mall", url: "/conoce-palmas-mall", order: 0 },
        { menuId: footerMenu.id, label: "Directorio", url: "/directorio", order: 1 },
        { menuId: footerMenu.id, label: "Eventos", url: "/eventos", order: 2 },
        { menuId: footerMenu.id, label: "Blog y noticias", url: "/blog", order: 3 },
        { menuId: footerMenu.id, label: "Momentos Palmas Mall", url: "/momentos-palmas-mall", order: 4 },
        { menuId: footerMenu.id, label: "Galardones", url: "/galardones", order: 5 },
        { menuId: footerMenu.id, label: "Be Our Sponsors", url: "/patrocinios", order: 6 },
        { menuId: footerMenu.id, label: "Plano del Mall", url: "/plano-del-mall", order: 7 },
        { menuId: footerMenu.id, label: "Cómo llegar", url: "/como-llegar", order: 8 },
        { menuId: footerMenu.id, label: "Contáctanos", url: "/contacto", order: 9 },
      ],
    });
  }
  console.log("  ✓ navegación (main + footer)");

  // ── Popup demo ──────────────────────────────────────────────
  const popupCount = await prisma.popup.count();
  if (popupCount === 0) {
    await prisma.popup.create({
      data: {
        internalName: "Eventos destacados (carrusel)",
        mode: "EVENT_CAROUSEL",
        eventIds: seededEventIds,
        title: "No te pierdas nada",
        body: "Estos son los próximos planes en Palmas Mall.",
        placement: "HOME",
        active: true,
        frequency: "ONCE_PER_SESSION",
        delaySeconds: 6,
        audience: "ALL",
      },
    });
  }
  console.log("  ✓ popup (carrusel de eventos)");

  console.log("→ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
