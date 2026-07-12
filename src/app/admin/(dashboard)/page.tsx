import Link from "next/link";
import {
  Storefront,
  CalendarStar,
  Article,
  Megaphone,
  Files,
  Envelope,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";
import { requireUser } from "@/lib/permissions";
import { AdminCard } from "@/components/admin/ui";
import { formatDateShortEs } from "@/lib/utils";

export default async function AdminDashboard() {
  const user = await requireUser("EDITOR");
  const now = new Date();

  const [
    localesCount,
    activeEvents,
    postsCount,
    activePopups,
    pagesCount,
    unreadMessages,
    recentAudit,
    recentMessages,
  ] = await Promise.all([
    prisma.local.count({ where: { deletedAt: null, status: ContentStatus.PUBLISHED } }),
    prisma.event.count({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }],
      },
    }),
    prisma.blogPost.count({ where: { deletedAt: null, status: ContentStatus.PUBLISHED } }),
    prisma.popup.count({ where: { deletedAt: null, active: true } }),
    prisma.page.count({ where: { deletedAt: null, status: ContentStatus.PUBLISHED } }),
    prisma.contactMessage.count({ where: { deletedAt: null, read: false } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const stats = [
    { label: "Locales publicados", value: localesCount, href: "/admin/locales", icon: Storefront },
    { label: "Eventos activos", value: activeEvents, href: "/admin/eventos", icon: CalendarStar },
    { label: "Posts publicados", value: postsCount, href: "/admin/blog", icon: Article },
    { label: "Popups activos", value: activePopups, href: "/admin/popups", icon: Megaphone },
    { label: "Páginas publicadas", value: pagesCount, href: "/admin/paginas", icon: Files },
    { label: "Mensajes sin leer", value: unreadMessages, href: "/admin/mensajes", icon: Envelope },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em] text-palm-950">
          Hola, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-mist-600">
          Este es el estado del sitio de Palmas Mall hoy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <stat.icon size={22} className="text-palm-700" />
            <p className="mt-3 font-display text-3xl font-bold text-palm-950">{stat.value}</p>
            <p className="mt-0.5 text-[13px] font-medium text-mist-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminCard title="Últimos cambios">
          {recentAudit.length ? (
            <ul className="divide-y divide-mist-100">
              {recentAudit.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-mist-800">
                      <span className="font-semibold text-palm-950">{log.userEmail || "sistema"}</span>{" "}
                      {actionLabel(log.action)}{" "}
                      <span className="font-medium">{log.entity}</span>
                      {log.entityName ? ` “${log.entityName}”` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-mist-500">
                    {formatDateShortEs(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist-500">Aún no hay actividad registrada.</p>
          )}
        </AdminCard>

        <AdminCard title="Últimos mensajes de contacto">
          {recentMessages.length ? (
            <ul className="divide-y divide-mist-100">
              {recentMessages.map((m) => (
                <li key={m.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-palm-950">
                      {m.name} {m.lastName}
                      {!m.read ? (
                        <span className="ml-2 inline-block size-2 rounded-full bg-leaf-500" aria-label="Sin leer" />
                      ) : null}
                    </p>
                    <span className="shrink-0 text-[12px] text-mist-500">
                      {formatDateShortEs(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-mist-600">{m.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist-500">No hay mensajes todavía.</p>
          )}
          <Link
            href="/admin/mensajes"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-palm-700 hover:text-palm-900"
          >
            Ver todos <ArrowRight size={14} weight="bold" />
          </Link>
        </AdminCard>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/locales/nuevo" className="pressable inline-flex h-10 items-center rounded-full bg-palm-700 px-5 text-sm font-semibold text-white hover:bg-palm-800">
          + Nuevo local
        </Link>
        <Link href="/admin/eventos/nuevo" className="pressable inline-flex h-10 items-center rounded-full border border-palm-700/30 bg-white px-5 text-sm font-semibold text-palm-800 hover:bg-palm-50">
          + Nuevo evento
        </Link>
        <Link href="/admin/blog/nuevo" className="pressable inline-flex h-10 items-center rounded-full border border-palm-700/30 bg-white px-5 text-sm font-semibold text-palm-800 hover:bg-palm-50">
          + Nuevo post
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="pressable inline-flex h-10 items-center rounded-full border border-mist-300 bg-white px-5 text-sm font-semibold text-mist-700 hover:bg-mist-100">
          Ver sitio público ↗
        </a>
      </div>
    </div>
  );
}

function actionLabel(action: string): string {
  switch (action) {
    case "create": return "creó";
    case "update": return "editó";
    case "delete": return "envió a papelera";
    case "restore": return "restauró";
    case "destroy": return "eliminó";
    case "publish": return "publicó";
    default: return action;
  }
}
