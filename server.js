/**
 * Startup file para el "Setup Node.js App" del cPanel (CloudLinux NodeJS Selector,
 * que corre sobre Passenger / lsnode de LiteSpeed).
 *
 * Por qué existe en vez de usar `next start`:
 * Passenger no entrega un puerto TCP, entrega la ruta de un socket Unix en la
 * variable PORT. El server.js que genera Next hace `parseInt(process.env.PORT)`,
 * que sobre una ruta da NaN y la app no arranca. Aquí se pasa el valor tal cual:
 * Node interpreta un string como ruta de socket y un número como puerto TCP,
 * así que el mismo archivo sirve en cPanel y en local.
 *
 * Requiere `npm run build` previo (necesita .next) y node_modules instalado.
 */

const { createServer } = require("http");
const next = require("next");

const target = process.env.PORT || 3000;
// Número puro -> puerto TCP. Cualquier otra cosa -> ruta de socket (Passenger).
const listenTarget = /^\d+$/.test(String(target)) ? Number(target) : String(target);

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(listenTarget, () => {
      console.log(`[server] Palmas Mall escuchando en ${listenTarget}`);
    });
  })
  .catch((error) => {
    console.error("[server] fallo al preparar Next", error);
    process.exit(1);
  });
