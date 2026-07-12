import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-palm-100 text-palm-800",
        leaf: "bg-leaf-500/15 text-palm-800",
        outline: "border border-mist-300 text-mist-700",
        dark: "bg-palm-950 text-white",
        warning: "bg-amber-100 text-amber-900",
        danger: "bg-red-100 text-red-800",
        muted: "bg-mist-100 text-mist-600",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
