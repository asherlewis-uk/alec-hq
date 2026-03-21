import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import {
  designMarker,
  focusRingClass,
  radiusClass,
  surfaceClass,
  textToneClass,
  transitionClass,
} from "@/lib/design/classes"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    radiusClass("glass"),
    transitionClass(),
    focusRingClass()
  ),
  {
    variants: {
      variant: {
        default: cn("bg-accent hover:bg-accent/90", textToneClass("primary")),
        destructive: cn(
          surfaceClass("danger"),
          textToneClass("primary"),
          "hover:border-red-400/40"
        ),
        outline: cn(
          surfaceClass("default"),
          textToneClass("primary"),
          "border-white/20 hover:glass-accent"
        ),
        secondary: cn(
          surfaceClass("default"),
          textToneClass("primary"),
          "hover:glass-accent"
        ),
        ghost: cn(textToneClass("primary"), "hover:glass"),
        link: cn(textToneClass("accent"), "underline-offset-4 hover:underline"),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: cn("h-10 w-10", radiusClass("pill")),
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
        {...designMarker("Button")}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
