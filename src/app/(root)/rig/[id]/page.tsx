"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Asset, CatalogAsset } from "@/lib/types";
import { AssetDetailHeader } from "@/components/assets/AssetDetailHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api/client";
import Link from "next/link";

function catalogToAsset(catalogAsset: CatalogAsset): Asset {
  return {
    id: catalogAsset.id,
    name: catalogAsset.name,
    category: catalogAsset.category,
    status: "ACTIVE",
    coverImage: catalogAsset.coverImage ?? null,
    isPublic: catalogAsset.isPublic,
    createdAt: catalogAsset.createdAt,
    updatedAt: catalogAsset.updatedAt,
  };
}

export default function RigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [catalogAsset, setCatalogAsset] = useState<CatalogAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCatalogAsset = useCallback(async () => {
    try {
      const assetResponse = await apiRequest<CatalogAsset>(
        `/api/catalog/assets/${id}`,
      );
      setCatalogAsset(assetResponse);
    } catch {
      router.push("/rig");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCatalogAsset();
  }, [fetchCatalogAsset]);

  const handleDelete = async () => {
    router.push("/rig");
  };

  const handleTogglePublic = async () => {
    // Catalog visibility is not workspace-editable
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-glass bg-white/5" />
        <Skeleton className="h-96 rounded-glass bg-white/5" />
      </div>
    );
  }

  if (!catalogAsset) {
    return (
      <div className="text-center text-text-secondary py-12">
        Asset not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssetDetailHeader
        asset={catalogToAsset(catalogAsset)}
        onDelete={handleDelete}
        onTogglePublic={handleTogglePublic}
      />

      {/* Catalog Specs */}
      {catalogAsset.specs && Object.keys(catalogAsset.specs).length > 0 && (
        <div className="glass rounded-glass p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(catalogAsset.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between text-sm border-b border-white/10 pb-2"
              >
                <span className="text-text-secondary">{key}</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace data links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/workspace/configurations"
          className="glass rounded-glass p-4 hover:bg-white/10 transition-colors"
        >
          <Badge
            variant="outline"
            className="bg-white/5 border-white/20 text-xs mb-2"
          >
            ⚙️ Configurations
          </Badge>
          <p className="text-sm text-text-secondary">
            View workspace configurations
          </p>
        </Link>
        <Link
          href="/workspace/logs"
          className="glass rounded-glass p-4 hover:bg-white/10 transition-colors"
        >
          <Badge
            variant="outline"
            className="bg-white/5 border-white/20 text-xs mb-2"
          >
            📋 Logs
          </Badge>
          <p className="text-sm text-text-secondary">View workspace logs</p>
        </Link>
        <Link
          href="/workspace/wishlist"
          className="glass rounded-glass p-4 hover:bg-white/10 transition-colors"
        >
          <Badge
            variant="outline"
            className="bg-white/5 border-white/20 text-xs mb-2"
          >
            ⭐ Wishlist
          </Badge>
          <p className="text-sm text-text-secondary">View workspace wishlist</p>
        </Link>
      </div>
    </div>
  );
}
