/**
 * Crea o restablece el usuario administrador, para correrse desde el botón
 * "Run JS Script" del Node App de cPanel.
 *
 * Lee ADMIN_EMAIL y ADMIN_PASSWORD de las variables de entorno. Si el usuario
 * existe le cambia la contraseña y lo reactiva; si no existe lo crea como
 * SUPER_ADMIN.
 *
 * Borra ADMIN_PASSWORD de las variables cuando termines: una contraseña en la
 * configuración de la app es una copia de más que no hace falta.
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || "";

if (!email || !password) {
  console.log("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en las variables de entorno.");
  process.exit(1);
}
if (password.length < 12) {
  console.log(`La contraseña tiene ${password.length} caracteres. Usa 12 o más.`);
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await hash(password, 12);
  const existente = await prisma.user.findUnique({ where: { email } });

  const usuario = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, active: true },
    create: { email, name: "Administrador", passwordHash, role: "SUPER_ADMIN", active: true },
  });

  console.log(existente ? "CONTRASEÑA ACTUALIZADA" : "USUARIO CREADO");
  console.log("email :", usuario.email);
  console.log("rol   :", usuario.role);
  console.log("activo:", usuario.active);
  console.log("\nEntra en /admin/login con ese email y la contraseña de ADMIN_PASSWORD.");
  console.log("Después borra ADMIN_PASSWORD de las variables de entorno.");
} catch (error) {
  console.log("FALLO:", error.message?.split("\n")[0] || error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
