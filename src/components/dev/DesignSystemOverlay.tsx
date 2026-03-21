"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getApprovedComponentMarkers,
  getRuntimeMonitorSnapshot,
  startRuntimeMonitor,
  subscribeToRuntimeMonitor,
} from "@/lib/design/runtime-monitor"

function formatLastScan(lastScanAt: number | null) {
  if (!lastScanAt) {
    return "waiting for scan"
  }

  return new Date(lastScanAt).toLocaleTimeString()
}

export function DesignSystemOverlay() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [snapshot, setSnapshot] = useState(getRuntimeMonitorSnapshot())

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return
    }

    const stopMonitoring = startRuntimeMonitor()
    const unsubscribe = subscribeToRuntimeMonitor(() => {
      setSnapshot(getRuntimeMonitorSnapshot())
    })

    return () => {
      unsubscribe()
      stopMonitoring()
    }
  }, [])

  const hasViolations = snapshot.violations.length > 0
  const approvedMarkers = useMemo(() => getApprovedComponentMarkers(), [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[140] w-full max-w-sm glass rounded-glass border border-white/15 p-4 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Design Monitor
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {hasViolations
              ? `${snapshot.violations.length} violation type(s) detected`
              : "No active design-token violations"}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:glass-accent"
        >
          {isExpanded ? "Hide" : "Inspect"}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
        <span>Last scan: {formatLastScan(snapshot.lastScanAt)}</span>
        <span>{approvedMarkers.length} tracked components</span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Violations
            </h2>
            {snapshot.violations.length === 0 ? (
              <p className="mt-2 text-sm text-text-secondary">
                Clean pass. No prohibited classes or inline styles were found.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {snapshot.violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="rounded-glass border border-red-400/20 bg-red-500/10 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {violation.token}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {violation.kind === "inline-style"
                            ? `Inline style found in ${violation.element}`
                            : `Found in ${violation.element}`}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-text-secondary">
                        {violation.count}×
                      </span>
                    </div>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[11px] text-text-muted">
                      {violation.example}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Component Usage
            </h2>
            <div className="mt-3 space-y-2">
              {snapshot.componentUsage.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No tracked UI components are mounted yet.
                </p>
              ) : (
                snapshot.componentUsage.map((usage) => (
                  <div
                    key={usage.component}
                    className="flex items-center justify-between rounded-glass border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-sm text-white">{usage.component}</span>
                    <span className="text-xs text-text-secondary">
                      {usage.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </aside>
  )
}
