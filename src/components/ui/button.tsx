import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-palm-700 text-white hover:bg-palm-800",
        dark: "bg-palm-950 text-white hover:bg-palm-900",
        secondary:
          "border border-palm-700/30 bg-white text-palm-800 hover:border-palm-700/60 hover:bg-palm-50",
        ghost: "text-palm-800 hover:bg-palm-100/70",
        onDark:
          "bg-white text-palm-900 hover:bg-mist-100",
        outlineOnDark:
          "border border-white/40 text-white hover:border-white/80 hover:bg-white/10",
        destructive: "bg-red-700 text-white hover:bg-red-800",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { Button, buttonVariants };
