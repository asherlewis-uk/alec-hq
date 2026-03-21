import * as React from "react"
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

const badgeVariants = cva(
  cn(
    "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold",
    radiusClass("pill"),
    transitionClass(),
    focusRingClass()
  ),
  {
    variants: {
      variant: {
        default: cn(surfaceClass("accent"), "border-orange-400/30", textToneClass("primary")),
        secondary: cn(surfaceClass("default"), "border-white/15", textToneClass("secondary")),
        destructive: cn(surfaceClass("danger"), "border-red-400/30", textToneClass("primary")),
        outline: cn("border-white/20", textToneClass("primary")),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      {...designMarker("Badge")}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
