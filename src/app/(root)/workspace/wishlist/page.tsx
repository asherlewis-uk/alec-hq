"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWorkspaceWishlist } from "@/lib/hooks/useWorkspaceWishlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/formatters";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "border-red-400/30 text-red-300",
  MEDIUM: "border-yellow-400/30 text-yellow-300",
  LOW: "border-green-400/30 text-green-300",
};

export default function WorkspaceWishlistPage() {
  const { wishlist, isLoading, error, fetchWishlist } = useWorkspaceWishlist();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">Wishlist</h2>
        <p className="text-text-secondary mt-1">Items you want to acquire</p>
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

      {!isLoading && !error && wishlist.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-text-secondary text-lg">Your wishlist is empty.</p>
        </div>
      )}

      {!isLoading && !error && wishlist.length > 0 && (
        <div className="space-y-3">
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              className="glass rounded-glass p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{item.name}</h3>
                  {item.brand && (
                    <p className="text-sm text-text-secondary">{item.brand}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-text-muted mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.estimatedPrice != null && (
                    <span className="text-sm text-text-secondary">
                      {formatCurrency(item.estimatedPrice)}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs ${PRIORITY_COLORS[item.priority] ?? ""}`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
