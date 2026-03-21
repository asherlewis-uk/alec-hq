"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWorkspaceConfigurations } from "@/lib/hooks/useWorkspaceConfigurations";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function WorkspaceConfigurationsPage() {
  const { configurations, isLoading, error, fetchConfigurations } =
    useWorkspaceConfigurations();

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-primary">Configurations</h2>
        <p className="text-secondary mt-1">
          Your rigs, setups, and arrangements
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-glass bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-glass p-4 border border-red-400/30">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && configurations.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-secondary text-lg">No configurations yet.</p>
        </div>
      )}

      {!isLoading && !error && configurations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configurations.map((config) => (
            <motion.div
              key={config.id}
              whileHover={{ y: -4 }}
              className="glass rounded-glass p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-primary font-medium text-lg">
                  {config.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs bg-white/10 border-white/20"
                >
                  {config.kind}
                </Badge>
              </div>
              {config.notes && (
                <p className="text-sm text-secondary">{config.notes}</p>
              )}
              <p className="text-xs text-muted mt-3">
                Updated {new Date(config.updatedAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
