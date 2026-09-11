/**
 * Diagnóstico de conexión a la base de datos, pensado para correrse desde el
 * botón "Run JS Script" del Node App de cPanel (no hay terminal en ese entorno).
 *
 * Imprime una línea por cada cosa que puede fallar, en vez del stack trace del
 * bundle de Prisma, que en cPanel sale ilegible.
 */

const url = process.env.DATABASE_URL;
console.log("NODE_ENV      :", process.env.NODE_ENV || "(sin definir)");
console.log(
  "DATABASE_URL  :",
  url ? url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@") : "NO DEFINIDA  <-- causa probable",
);

if (!url) {
  console.log("\nLa variable no llega al proceso. Revisa Environment variables en el Node App.");
  process.exit(1);
}

let PrismaClient;
try {
  ({ PrismaClient } = await import("@prisma/client"));
} catch (error) {
  console.log("\nNo se pudo cargar @prisma/client:", error.message.split("\n")[0]);
  console.log("Falta correr `prisma generate` (lo hace el postinstall de npm install).");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const [row] = await prisma.$queryRaw`SELECT version()`;
  console.log("\nCONEXION OK");
  console.log("servidor      :", row.version);
  const tablas = await prisma.$queryRaw`
    SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log("tablas public :", tablas[0].n);
} catch (error) {
  console.log("\nFALLO DE CONEXION");
  console.log("codigo        :", error.code || "(sin codigo)");
  console.log("mensaje       :");
  const lineas = (error.message || "").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const linea of lineas.slice(0, 6)) console.log("  " + linea);
  console.log("\nP1001 = no hay ruta al servidor (firewall del cPanel bloquea la salida).");
  console.log("P1000 = credenciales malas. P1003 = la base no existe.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
