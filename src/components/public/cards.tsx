import Link from "next/link";
import type { Local, LocalCategory, Event, BlogPost } from "@prisma/client";
import { Media } from "@/components/public/media";
import { Badge } from "@/components/ui/badge";
import { formatDateShortEs } from "@/lib/utils";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";

const FALLBACK_COVER = "/images/galeria/shopping-cali2.webp";

export function LocalCard({
  local,
}: {
  local: Local & { category: LocalCategory | null };
}) {
  return (
    <Link
      href={`/locales/${local.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist-100">
        <Media
          src={local.coverUrl || FALLBACK_COVER}
          alt={`${local.name} en Palmas Mall`}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 280px"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
        />
        {local.comingSoon ? (
          <div className="absolute left-3 top-3">
            <Badge variant="dark">Próximamente</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[17px] font-bold leading-snug text-palm-950">
            {local.name}
          </h3>
        </div>
        {local.category ? (
          <p className="mt-0.5 text-[13px] font-medium text-palm-600">{local.category.name}</p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist-600">
          {local.shortDescription}
        </p>
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-card-hover sm:p-4"
    >
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-mist-100 sm:w-28">
        <Media
          src={event.coverUrl || FALLBACK_COVER}
          alt={event.title}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-palm-700">
          <CalendarBlank size={15} weight="bold" />
          {formatDateShortEs(event.startsAt)}
          {event.timeLabel ? ` · ${event.timeLabel}` : ""}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-[16px] font-bold leading-snug text-palm-950 sm:text-[17px]">
          {event.title}
        </h3>
        {event.location ? (
          <p className="mt-1 flex items-center gap-1 text-[13px] text-mist-500">
            <MapPin size={14} /> {event.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist-100">
        <Media
          src={post.coverUrl || FALLBACK_COVER}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] font-semibold text-palm-600">
          {post.category} · {formatDateShortEs(post.publishedAt)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold leading-snug text-palm-950">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist-600">{post.excerpt}</p>
      </div>
    </Link>
  );
}
