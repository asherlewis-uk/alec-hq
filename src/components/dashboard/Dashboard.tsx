"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWorkspaceAssets } from "@/lib/hooks/useWorkspaceAssets";
import { useWorkspaceLogs } from "@/lib/hooks/useWorkspaceLogs";
import { useWorkspaceWishlist } from "@/lib/hooks/useWorkspaceWishlist";
import { useWorkspaceConfigurations } from "@/lib/hooks/useWorkspaceConfigurations";
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const {
    assets,
    isLoading: assetsLoading,
    fetchAssets,
  } = useWorkspaceAssets();
  const { logs, isLoading: logsLoading, fetchLogs } = useWorkspaceLogs();
  const {
    wishlist,
    isLoading: wishlistLoading,
    fetchWishlist,
  } = useWorkspaceWishlist();
  const {
    configurations,
    isLoading: configsLoading,
    fetchConfigurations,
  } = useWorkspaceConfigurations();

  useEffect(() => {
    fetchAssets();
    fetchLogs();
    fetchWishlist();
    fetchConfigurations();
  }, [fetchAssets, fetchLogs, fetchWishlist, fetchConfigurations]);

  const isLoading =
    assetsLoading || logsLoading || wishlistLoading || configsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-glass bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-glass bg-white/5" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Linked Assets"
          value={assets.length.toString()}
          emoji="🔗"
        />
        <StatCard
          label="Configurations"
          value={configurations.length.toString()}
          emoji="🔧"
        />
        <StatCard
          label="Wishlist"
          value={wishlist.length.toString()}
          emoji="⭐"
        />
        <StatCard
          label="Recent Logs"
          value={logs.length.toString()}
          emoji="📋"
        />
      </div>

      {/* Recent workspace assets */}
      {assets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Linked Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.slice(0, 6).map((item) => (
              <motion.div
                key={item.link.id}
                whileHover={{ y: -4 }}
                className="glass rounded-glass p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">
                    {item.catalogAsset?.name ?? "Unknown Asset"}
                  </h4>
                  <span className="text-xs text-text-secondary bg-white/10 px-2 py-0.5 rounded">
                    {item.link.localStatus}
                  </span>
                </div>
                {item.catalogAsset?.category && (
                  <p className="text-xs text-text-secondary">
                    {item.catalogAsset.category}
                  </p>
                )}
                {item.link.notes && (
                  <p className="text-sm text-text-muted mt-2 line-clamp-2">
                    {item.link.notes}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-text-secondary text-lg">
            No assets linked yet. Browse the catalog to get started!
          </p>
        </div>
      )}
    </motion.div>
  );
}
