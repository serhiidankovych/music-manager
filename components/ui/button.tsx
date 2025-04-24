import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        candy: [
          "bg-gradient-to-br from-[oklch(0.8_0.2_86)] via-[oklch(0.75_0.22_80)] to-[oklch(0.85_0.18_92)]",
          "text-primary-foreground font-bold",
          "shadow-lg hover:shadow-xl",
          "transform hover:-translate-y-0.5 transition-all duration-200",
          "active:translate-y-0 active:shadow-md",
          "border-2 border-white/30",
          "hover:brightness-110",
          "dark:from-[oklch(0.7_0.22_86)] dark:via-[oklch(0.65_0.24_80)] dark:to-[oklch(0.75_0.2_92)]",
          "relative overflow-hidden",
          "before:content-[''] before:absolute before:inset-0",
          "before:bg-[radial-gradient(ellipse_at_center,white_0%,transparent_70%)]",
          "before:opacity-0 hover:before:opacity-40",
          "before:transition-opacity before:duration-300",
          "after:content-[''] after:absolute after:inset-0",
          "after:bg-[radial-gradient(ellipse_at_center,oklch(1_0.2_86)_0%,transparent_70%)]",
          "after:opacity-0 hover:after:opacity-30",
          "after:transition-opacity after:duration-500",
          "shadow-[0_0_15px_rgba(250,230,100,0.5)] hover:shadow-[0_0_25px_rgba(250,230,100,0.7)]",
          "z-0",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
