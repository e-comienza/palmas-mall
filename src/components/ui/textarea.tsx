import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-mist-300 bg-white px-4 py-3 text-[15px] text-mist-900 placeholder:text-mist-500 transition-colors focus:border-palm-600 focus:outline-none focus:ring-2 focus:ring-palm-600/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
