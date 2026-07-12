import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-mist-300 bg-white px-4 text-[15px] text-mist-900 placeholder:text-mist-500 transition-colors focus:border-palm-600 focus:outline-none focus:ring-2 focus:ring-palm-600/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
