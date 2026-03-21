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
    glass: "20px",
    glassLg: "28px",
  },
  utilities: {
    surface: "glass",
    surfaceAccent: "glass-accent",
    surfaceSuccess: "glass-success",
    surfaceWarning: "glass-warning",
    surfaceDanger: "glass-danger",
    roundedGlass: "rounded-glass",
    roundedGlassLg: "rounded-glass-lg",
    textSecondary: "text-text-secondary",
    textMuted: "text-text-muted",
    accentBackground: "bg-accent",
    accentText: "text-accent",
    standardTransition: "transition-all duration-200",
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
      /(^|.*:)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|data-\[state=open\]:bg-secondary)(?:$|\s)/,
    ],
  },
} as const

export type DesignTokens = typeof designTokens
export type DesignColorToken = keyof typeof designTokens.colors
export type DesignUtilityToken =
  (typeof designTokens.utilities)[keyof typeof designTokens.utilities]
export type DesignComponentMarker =
  (typeof designTokens.componentMarkers)[number]

export function isDisallowedDesignToken(token: string) {
  return designTokens.runtimeValidation.prohibitedClassPatterns.some((pattern) =>
    pattern.test(token)
  )
}
