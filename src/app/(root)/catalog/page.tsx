"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCatalogAssets } from "@/lib/hooks/useCatalogAssets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetCategory, CatalogAsset } from "@/lib/types";
import { getCategoryEmoji, getCategoryLabel } from "@/lib/utils/formatters";

const CATEGORIES: { value: AssetCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "VEHICLE", label: "Vehicles" },
  { value: "RIG", label: "Rigs" },
  { value: "PERIPHERAL", label: "Peripherals" },
  { value: "NETWORK", label: "Network" },
];

function CatalogCard({ asset }: { asset: CatalogAsset }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-glass p-4 transition-all duration-200 h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-secondary">
            {getCategoryLabel(asset.category)}
          </p>
          <h3 className="text-lg font-bold text-primary mt-1 line-clamp-2">
            {asset.name}
          </h3>
        </div>
        <span className="text-2xl">{getCategoryEmoji(asset.category)}</span>
      </div>

      {asset.manufacturer && (
        <p className="text-sm text-secondary">
          {asset.manufacturer}
          {asset.model ? ` ${asset.model}` : ""}
        </p>
      )}

      {asset.summary && (
        <p className="text-sm text-secondary mt-2 line-clamp-2">
          {asset.summary}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs bg-white/10 border-white/20"
        >
          {asset.category}
        </Badge>
      </div>

      <p className="text-xs text-muted mt-3">
        Updated {new Date(asset.updatedAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
}

export default function CatalogPage() {
  const { assets, isLoading, error, fetchAssets } = useCatalogAssets();
  const [selectedCategory, setSelectedCategory] = useState<
    AssetCategory | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssets({
      category: selectedCategory === "ALL" ? undefined : selectedCategory,
      search: searchQuery || undefined,
    });
  }, [fetchAssets, selectedCategory, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-primary">Catalog</h2>
        <p className="text-secondary mt-1">
          Browse the shared asset library
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-primary placeholder:text-muted"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-glass text-sm transition-all duration-200 ${
                selectedCategory === cat.value
                  ? "bg-accent text-primary font-medium"
                  : "glass text-secondary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-glass bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-glass p-4 border border-red-400/30">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <CatalogCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {!isLoading && !error && assets.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-secondary text-lg">
            No catalog assets found.
          </p>
        </div>
      )}
    </motion.div>
  );
}
