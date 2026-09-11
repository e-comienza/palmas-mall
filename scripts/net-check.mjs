/**
 * Diagnóstico de salida a red, para separar tres causas que dan el mismo
 * error de Prisma ("Can't reach database server"):
 *   - el DNS no resuelve
 *   - no hay salida al puerto de la base (firewall del hosting)
 *   - no hay salida a ningún lado
 *
 * Prueba el destino real y, como control, un puerto estándar. Si el control
 * pasa y el destino no, el bloqueo es por puerto y hay evidencia para pedirle
 * al proveedor que lo abra.
 */

import { lookup } from "node:dns/promises";
import { connect } from "node:net";

const TIEMPO_LIMITE = 8000;

function probarTcp(host, puerto) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const socket = connect({ host, port: puerto });
    const terminar = (resultado) => {
      socket.destroy();
      resolve({ ...resultado, ms: Date.now() - inicio });
    };
    socket.setTimeout(TIEMPO_LIMITE);
    socket.on("connect", () => terminar({ ok: true }));
    socket.on("timeout", () => terminar({ ok: false, motivo: "timeout (sin respuesta)" }));
    socket.on("error", (error) => terminar({ ok: false, motivo: error.code || error.message }));
  });
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL no está definida.");
  process.exit(1);
}

const { hostname, port } = new URL(url);
const puerto = Number(port || 5432);

console.log(`destino: ${hostname}:${puerto}\n`);

try {
  const { address } = await lookup(hostname);
  console.log(`DNS            : OK -> ${address}`);
} catch (error) {
  console.log(`DNS            : FALLA (${error.code || error.message})`);
  console.log("\nEl servidor no resuelve ese nombre. No es firewall de puertos.");
  process.exit(1);
}

const destino = await probarTcp(hostname, puerto);
console.log(
  `TCP ${puerto}`.padEnd(15) + `: ${destino.ok ? "OK" : `FALLA (${destino.motivo})`} [${destino.ms} ms]`,
);

const control = await probarTcp("github.com", 443);
console.log(`TCP 443 control: ${control.ok ? "OK" : `FALLA (${control.motivo})`} [${control.ms} ms]`);

console.log("");
if (destino.ok) {
  console.log("Hay salida al puerto de la base. El problema no es de red.");
} else if (control.ok) {
  console.log(`Sale por 443 pero no por ${puerto}: el firewall filtra por puerto.`);
  console.log(`Pedir al proveedor: permitir salida TCP a ${hostname}:${puerto}.`);
} else {
  console.log("No hay salida ni por 443: el bloqueo de egreso es general.");
}
process.exitCode = destino.ok ? 0 : 1;
