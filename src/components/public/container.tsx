import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  intro,
  className,
  align = "left",
}: {
  title: string;
  intro?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-8 sm:mb-12", align === "center" && "text-center", className)}>
      <h2 className="font-display text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-palm-950 sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className={cn("mt-3 max-w-[58ch] text-[15px] leading-relaxed text-mist-600 sm:text-base", align === "center" && "mx-auto")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
