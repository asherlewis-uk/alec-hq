export const designTokens = {
  colors: {
    accent: "#FF6B00",
    glassLight: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.12)",
    glassDark: "rgba(0, 0, 0, 0.25)",
    textPrimary: "rgba(255, 255, 255, 0.92)",
    textSecondary: "rgba(255, 255, 255, 0.55)",
    textMuted: "rgba(255, 255, 255, 0.45)",
  },
  gradients: {
    appBackgroundClass: "bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]",
    appBackgroundStyle: "linear-gradient(135deg, #0d0d1a 0%, #1a0a00 100%)",
  },
  radii: {
    glass: "rounded-glass",
    glassLg: "rounded-glass-lg",
    pill: "rounded-full",
  },
  sheetSideRadii: {
    top: "rounded-b-[20px]",
    bottom: "rounded-t-[20px]",
    left: "rounded-r-[20px]",
    right: "rounded-l-[20px]",
  },
  textTones: {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted",
    accent: "text-accent",
  },
  surfaceVariants: {
    default: "glass",
    accent: "glass glass-accent",
    success: "glass glass-success",
    warning: "glass glass-warning",
    danger: "glass glass-danger",
  },
  utilities: {
    accentBackground: "bg-accent",
    accentText: "text-accent",
    standardTransition: "transition-all duration-200",
    focusRing: "focus-visible:ring-2 focus-visible:ring-accent/60",
  },
  componentMarkers: [
    "AppShell",
    "Sidebar",
    "TopBar",
    "Button",
    "Badge",
    "Input",
    "Card",
    "CardHeader",
    "CardContent",
    "CardFooter",
    "SheetContent",
    "PwaInstallGate",
  ] as const,
  runtimeValidation: {
    prohibitedClassPatterns: [
      /(^|.*:)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?|bg-gray-\d+(?:\/\d+)?)(?:$|\s)/,
    ],
  },
} as const

export type DesignTokens = typeof designTokens
export type DesignColorToken = keyof typeof designTokens.colors
export type DesignTextTone = keyof typeof designTokens.textTones
export type DesignSurfaceVariant = keyof typeof designTokens.surfaceVariants
export type DesignRadiusVariant = keyof typeof designTokens.radii
export type DesignSheetSide = keyof typeof designTokens.sheetSideRadii
export type DesignUtilityToken =
  (typeof designTokens.utilities)[keyof typeof designTokens.utilities]
export type DesignComponentMarker =
  (typeof designTokens.componentMarkers)[number]

export function isDisallowedDesignToken(token: string) {
  return designTokens.runtimeValidation.prohibitedClassPatterns.some((pattern) =>
    pattern.test(token)
  )
}
