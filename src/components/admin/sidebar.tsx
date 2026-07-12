"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  SquaresFour,
  Storefront,
  CalendarStar,
  Article,
  Files,
  Megaphone,
  Images,
  ChatCircleText,
  ListDashes,
  Gear,
  MagnifyingGlass,
  Users,
  Trash,
  ClockCounterClockwise,
  SignOut,
  List,
  X,
  Envelope,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const NAV: { section: string; items: { href: string; label: string; icon: React.ElementType; min?: Role }[] }[] = [
  {
    section: "Contenido",
    items: [
      { href: "/admin", label: "Dashboard", icon: SquaresFour },
      { href: "/admin/locales", label: "Locales", icon: Storefront },
      { href: "/admin/eventos", label: "Eventos", icon: CalendarStar },
      { href: "/admin/blog", label: "Blog y noticias", icon: Article },
      { href: "/admin/paginas", label: "Páginas", icon: Files },
      { href: "/admin/galeria", label: "Galería", icon: Images },
      { href: "/admin/faqs", label: "FAQs", icon: ChatCircleText },
      { href: "/admin/popups", label: "Popups", icon: Megaphone },
    ],
  },
  {
    section: "Sitio",
    items: [
      { href: "/admin/mensajes", label: "Mensajes", icon: Envelope },
      { href: "/admin/navegacion", label: "Navegación", icon: ListDashes },
      { href: "/admin/seo", label: "SEO", icon: MagnifyingGlass },
      { href: "/admin/configuracion", label: "Configuración", icon: Gear, min: "SUPER_ADMIN" },
    ],
  },
  {
    section: "Sistema",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", icon: Users, min: "SUPER_ADMIN" },
      { href: "/admin/papelera", label: "Papelera", icon: Trash, min: "ADMIN" },
      { href: "/admin/auditoria", label: "Auditoría", icon: ClockCounterClockwise, min: "ADMIN" },
    ],
  },
];

const LEVEL: Record<Role, number> = { EDITOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export function AdminSidebar({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.min || LEVEL[user.role] >= LEVEL[i.min]);
        if (!items.length) return null;
        return (
          <div key={group.section}>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-mist-500">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-palm-700 text-white"
                          : "text-mist-700 hover:bg-mist-100 hover:text-palm-950",
                      )}
                    >
                      <item.icon size={18} weight={active ? "fill" : "regular"} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-mist-200 p-4">
      <p className="truncate text-sm font-semibold text-palm-950">{user.name}</p>
      <p className="truncate text-[12px] text-mist-500">
        {user.email} · {user.role.replace("_", " ").toLowerCase()}
      </p>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-mist-300 py-2 text-sm font-semibold text-mist-700 transition-colors hover:bg-mist-100"
      >
        <SignOut size={16} /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <>
      {/* Topbar móvil */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-mist-200 bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/brand/favicon.png" alt="" width={28} height={21} className="h-6 w-auto" />
          <span className="font-display text-sm font-bold text-palm-950">Admin Palmas Mall</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="pressable flex size-10 items-center justify-center rounded-full text-palm-950"
        >
          {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </div>

      {/* Drawer móvil */}
      {open ? (
        <div className="fixed inset-0 top-14 z-30 flex flex-col bg-white lg:hidden">
          <div className="flex-1 overflow-y-auto pt-4">{nav}</div>
          {footer}
        </div>
      ) : null}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-mist-200 bg-white lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-6 py-5">
          <Image src="/brand/favicon.png" alt="" width={32} height={24} className="h-7 w-auto" />
          <span className="font-display text-[15px] font-bold text-palm-950">
            Palmas Mall
          </span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  );
}
