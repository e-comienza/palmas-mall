import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

/** Duración máxima de la sesión y cada cuánto se refresca la cookie. */
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 h
const SESSION_UPDATE_AGE = 60 * 60; // 1 h

/**
 * Cada cuánto se revalida el token contra la base de datos. El rol y el estado
 * `active` viajan dentro del JWT: sin esta comprobación, desactivar, degradar o
 * borrar un usuario no le quitaba el acceso hasta que expirase la sesión.
 */
const REVALIDATE_EVERY_SECONDS = 5 * 60;

/** Fuerza bruta contra /admin/login. */
const LOGIN_ATTEMPTS_PER_WINDOW = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 min

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE, updateAge: SESSION_UPDATE_AGE },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        // Dos cubos: por cuenta (evita reventar una contraseña concreta) y por
        // IP (evita probar una contraseña común contra muchas cuentas).
        const ip = await clientIp();
        const perAccount = rateLimit(`login:email:${email}`, LOGIN_ATTEMPTS_PER_WINDOW, LOGIN_WINDOW_MS);
        const perIp = rateLimit(`login:ip:${ip}`, LOGIN_ATTEMPTS_PER_WINDOW * 4, LOGIN_WINDOW_MS);
        if (!perAccount.ok || !perIp.ok) {
          console.warn(`[auth] intentos de login excedidos (email=${email} ip=${ip})`);
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.checkedAt = now;
        return token;
      }

      // Tokens emitidos antes de este cambio no traen `id`: forzar login.
      if (typeof token.id !== "string") return null;

      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (now - checkedAt < REVALIDATE_EVERY_SECONDS) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { role: true, active: true },
      });
      // Usuario borrado o desactivado: devolver null borra la cookie de sesión.
      if (!dbUser || !dbUser.active) return null;

      token.role = dbUser.role;
      token.checkedAt = now;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
