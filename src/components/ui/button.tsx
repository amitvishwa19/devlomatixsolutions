import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow border cursor-pointer hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground shadow border cursor-pointer hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 cursor-pointer",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0",
        heroOutline: "border border-border/80 bg-background/80 backdrop-blur-md text-foreground font-semibold hover:bg-primary/10 hover:border-primary/50 hover:text-primary shadow-xs hover:shadow-md transition-all cursor-pointer",
        glow: "bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
