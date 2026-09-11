/**
 * Ejecuta un comando y reimprime su salida sin las líneas gigantes.
 *
 * Existe por el CLI de Prisma: cuando falla, Node imprime la línea de código
 * culpable, y como el bundle de Prisma es una sola línea de ~200 KB, el mensaje
 * de error real queda sepultado. En el Node App de cPanel, que muestra la salida
 * en una cajita, eso lo vuelve ilegible.
 *
 * Uso: node scripts/run-quiet.mjs prisma generate
 */

import { spawn } from "node:child_process";
import { join, delimiter } from "node:path";

const LARGO_MAXIMO = 400; // una línea más larga que esto es código minificado, no un mensaje

const comando = process.argv.slice(2);
if (comando.length === 0) {
  console.error("uso: node scripts/run-quiet.mjs <comando...>");
  process.exit(2);
}

// Tras el `cd` que hacen los scripts de package.json, el cwd es la raíz del
// proyecto. Anteponer su node_modules/.bin al PATH hace que `prisma` y demás
// binarios se resuelvan sin depender del PATH que arme npm, que en cPanel
// apunta al directorio del entorno virtual.
const binLocal = join(process.cwd(), "node_modules", ".bin");
const entorno = { ...process.env, PATH: `${binLocal}${delimiter}${process.env.PATH || ""}` };

const hijo = spawn(comando[0], comando.slice(1), { shell: true, env: entorno });

let salida = "";
const acumular = (trozo) => {
  salida += trozo.toString();
};
hijo.stdout.on("data", acumular);
hijo.stderr.on("data", acumular);

hijo.on("error", (error) => {
  console.error("no se pudo ejecutar:", error.message);
  process.exit(1);
});

hijo.on("close", (codigo) => {
  const lineas = salida.split("\n").filter((linea) => linea.length <= LARGO_MAXIMO);
  const texto = lineas.join("\n").trim();
  console.log(texto || "(sin salida legible)");
  if (codigo !== 0) console.log(`\n[run-quiet] el comando terminó con código ${codigo}`);
  process.exit(codigo ?? 0);
});
