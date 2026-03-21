import {
  designTokens,
  isDisallowedDesignToken,
  type DesignComponentMarker,
} from "@/lib/design/tokens"

export type DesignViolation = {
  id: string
  kind: "class-token" | "inline-style"
  token: string
  count: number
  example: string
  element: string
}

export type ComponentUsage = {
  component: string
  count: number
}

export type RuntimeMonitorSnapshot = {
  violations: DesignViolation[]
  componentUsage: ComponentUsage[]
  lastScanAt: number | null
}

const listeners = new Set<() => void>()

let snapshot: RuntimeMonitorSnapshot = {
  violations: [],
  componentUsage: [],
  lastScanAt: null,
}

let observer: MutationObserver | null = null
let activeMonitorCount = 0
let scanScheduled = false

function emit() {
  listeners.forEach((listener) => listener())
}

function getElementDescriptor(element: Element) {
  const component = element.getAttribute("data-ui-component")
  if (component) {
    return component
  }

  return element.tagName.toLowerCase()
}

function buildViolationMap(root: ParentNode) {
  const violations = new Map<string, DesignViolation>()

  root.querySelectorAll<HTMLElement>("[class]").forEach((element) => {
    const className = element.getAttribute("class")
    if (!className) return

    className
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => {
        if (!isDisallowedDesignToken(token)) return

        const key = `class-token:${token}`
        const existing = violations.get(key)
        if (existing) {
          existing.count += 1
          return
        }

        violations.set(key, {
          id: key,
          kind: "class-token",
          token,
          count: 1,
          example: className,
          element: getElementDescriptor(element),
        })
      })
  })

  root.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    const styleAttribute = element.getAttribute("style")
    if (!styleAttribute) return

    const key = `inline-style:${getElementDescriptor(element)}`
    const existing = violations.get(key)
    if (existing) {
      existing.count += 1
      return
    }

    violations.set(key, {
      id: key,
      kind: "inline-style",
      token: "style",
      count: 1,
      example: styleAttribute,
      element: getElementDescriptor(element),
    })
  })

  return [...violations.values()].sort((left, right) => right.count - left.count)
}

function buildComponentUsage(root: ParentNode) {
  const usage = new Map<string, number>()
  const approvedMarkers = new Set<DesignComponentMarker>(
    designTokens.componentMarkers
  )

  root.querySelectorAll<HTMLElement>("[data-ui-component]").forEach((element) => {
    const marker = element.getAttribute("data-ui-component")

    if (!marker) return
    if (!approvedMarkers.has(marker as DesignComponentMarker)) return

    usage.set(marker, (usage.get(marker) ?? 0) + 1)
  })

  return [...usage.entries()]
    .map(([component, count]) => ({ component, count }))
    .sort((left, right) => right.count - left.count)
}

function scanDocument() {
  if (typeof document === "undefined") {
    return
  }

  snapshot = {
    violations: buildViolationMap(document),
    componentUsage: buildComponentUsage(document),
    lastScanAt: Date.now(),
  }

  emit()
}

function scheduleScan() {
  if (scanScheduled || typeof window === "undefined") {
    return
  }

  scanScheduled = true
  window.requestAnimationFrame(() => {
    scanScheduled = false
    scanDocument()
  })
}

function initializeObserver() {
  if (typeof document === "undefined" || observer || !document.body) {
    return false
  }

  observer = new MutationObserver(() => {
    scheduleScan()
  })

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-ui-component"],
  })

  scheduleScan()
  return true
}

export function subscribeToRuntimeMonitor(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getRuntimeMonitorSnapshot() {
  return snapshot
}

export function startRuntimeMonitor() {
  if (process.env.NODE_ENV === "production" || typeof document === "undefined") {
    return () => {}
  }

  activeMonitorCount += 1

  let disposed = false
  let removeDeferredSetup: (() => void) | null = null

  const ensureObserver = () => {
    if (disposed) {
      return
    }

    if (initializeObserver() && removeDeferredSetup) {
      removeDeferredSetup()
      removeDeferredSetup = null
    }
  }

  if (!initializeObserver()) {
    const onDocumentReady = () => {
      ensureObserver()
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDocumentReady, {
        once: true,
      })
      removeDeferredSetup = () => {
        document.removeEventListener("DOMContentLoaded", onDocumentReady)
      }
    } else {
      const intervalId = window.setInterval(() => {
        if (
          document.body ||
          document.readyState === "interactive" ||
          document.readyState === "complete"
        ) {
          window.clearInterval(intervalId)
          ensureObserver()
        }
      }, 0)

      removeDeferredSetup = () => {
        window.clearInterval(intervalId)
      }
    }
  }

  return () => {
    disposed = true

    if (removeDeferredSetup) {
      removeDeferredSetup()
      removeDeferredSetup = null
    }

    activeMonitorCount = Math.max(0, activeMonitorCount - 1)

    if (activeMonitorCount === 0 && observer) {
      observer.disconnect()
      observer = null
    }
  }
}

export function getApprovedComponentMarkers() {
  return designTokens.componentMarkers
}
