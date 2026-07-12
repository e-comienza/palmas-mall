"use client";

import {
  InstagramLogo,
  TiktokLogo,
  FacebookLogo,
  XLogo,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function SocialIcons({
  instagramUrl,
  tiktokUrl,
  facebookUrl,
  twitterUrl,
  onDark = false,
}: {
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  onDark?: boolean;
}) {
  const cls = cn(
    "pressable flex size-11 items-center justify-center rounded-full transition-colors",
    onDark
      ? "bg-white/10 text-white hover:bg-white/20"
      : "bg-white text-palm-800 shadow-card hover:bg-palm-50",
  );
  const links = [
    { url: instagramUrl, label: "Instagram", Icon: InstagramLogo },
    { url: tiktokUrl, label: "TikTok", Icon: TiktokLogo },
    { url: facebookUrl, label: "Facebook", Icon: FacebookLogo },
    { url: twitterUrl, label: "X (Twitter)", Icon: XLogo },
  ].filter((l) => Boolean(l.url));

  return (
    <div className="flex items-center gap-3">
      {links.map(({ url, label, Icon }) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={cls}>
          <Icon size={22} />
        </a>
      ))}
    </div>
  );
}
