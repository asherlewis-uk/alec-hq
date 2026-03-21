import * as React from "react"

import {
  designMarker,
  focusRingClass,
  radiusClass,
  textToneClass,
  transitionClass,
} from "@/lib/design/classes"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        {...designMarker("Input")}
        type={type}
        className={cn(
          "flex h-10 w-full border border-white/15 bg-white/5 px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          radiusClass("glass"),
          textToneClass("primary"),
          transitionClass(),
          focusRingClass(),
          "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
