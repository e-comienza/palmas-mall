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

const LARGO_MAXIMO = 400; // una línea más larga que esto es código minificado, no un mensaje

const comando = process.argv.slice(2);
if (comando.length === 0) {
  console.error("uso: node scripts/run-quiet.mjs <comando...>");
  process.exit(2);
}

const hijo = spawn(comando[0], comando.slice(1), { shell: true });

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
