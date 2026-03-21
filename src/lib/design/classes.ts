import {
  designTokens,
  type DesignComponentMarker,
  type DesignRadiusVariant,
  type DesignSheetSide,
  type DesignSurfaceVariant,
  type DesignTextTone,
} from "@/lib/design/tokens"

export function surfaceClass(variant: DesignSurfaceVariant = "default") {
  return designTokens.surfaceVariants[variant]
}

export function textToneClass(tone: DesignTextTone = "primary") {
  return designTokens.textTones[tone]
}

export function radiusClass(radius: DesignRadiusVariant = "glass") {
  return designTokens.radii[radius]
}

export function sheetSideRadiusClass(side: DesignSheetSide) {
  return designTokens.sheetSideRadii[side]
}

export function transitionClass() {
  return designTokens.utilities.standardTransition
}

export function focusRingClass() {
  return designTokens.utilities.focusRing
}

export function designMarker(marker: DesignComponentMarker) {
  return {
    "data-ui-component": marker,
  } as const
}
