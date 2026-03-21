"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWorkspaceLogs } from "@/lib/hooks/useWorkspaceLogs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatCurrency,
  formatMileage,
} from "@/lib/utils/formatters";

const TYPE_COLORS: Record<string, string> = {
  MAINTENANCE: "border-blue-400/30 text-blue-300",
  UPGRADE: "border-green-400/30 text-green-300",
  REPAIR: "border-red-400/30 text-red-300",
  INSPECTION: "border-yellow-400/30 text-yellow-300",
  NOTE: "border-white/20 text-secondary",
};

export default function WorkspaceLogsPage() {
  const { logs, isLoading, error, fetchLogs } = useWorkspaceLogs();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-primary">Logs</h2>
        <p className="text-secondary mt-1">
          Maintenance, upgrades, and notes
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-glass bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-glass p-4 border border-red-400/30">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && logs.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-secondary text-lg">No logs yet.</p>
        </div>
      )}

      {!isLoading && !error && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              whileHover={{ x: 4 }}
              className="glass rounded-glass p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-primary font-medium">{log.title}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${TYPE_COLORS[log.type] ?? ""}`}
                    >
                      {log.type}
                    </Badge>
                  </div>
                  {log.description && (
                    <p className="text-sm text-secondary mt-1">
                      {log.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                    <span>{formatDate(log.date)}</span>
                    {log.mileage != null && (
                      <span>{formatMileage(log.mileage)}</span>
                    )}
                    {log.cost != null && (
                      <span>{formatCurrency(log.cost)}</span>
                    )}
                    {log.performedBy && <span>by {log.performedBy}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
