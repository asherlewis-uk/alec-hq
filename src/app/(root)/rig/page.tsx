"use client";

import {
  useWorkspaceAssets,
  WorkspaceAssetView,
} from "@/lib/hooks/useWorkspaceAssets";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { useEffect, useMemo } from "react";
import type { Asset } from "@/lib/types";

function toAsset(view: WorkspaceAssetView): Asset {
  const ca = view.catalogAsset;
  return {
    id: ca?.id ?? view.link.catalogAssetId,
    name: ca?.name ?? "Unknown",
    category: ca?.category ?? "RIG",
    status: view.link.localStatus,
    coverImage: ca?.coverImage ?? null,
    isPublic: ca?.isPublic ?? false,
    createdAt: view.link.createdAt,
    updatedAt: view.link.updatedAt,
  };
}

const RIG_CATEGORIES = new Set(["RIG", "PERIPHERAL", "NETWORK"]);

export default function RigPage() {
  const { assets, isLoading, error, fetchAssets } = useWorkspaceAssets();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const filteredAssets = useMemo(
    () =>
      assets
        .filter(
          (a) => a.catalogAsset && RIG_CATEGORIES.has(a.catalogAsset.category),
        )
        .map(toAsset),
    [assets],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">💻 The Rig</h1>
      {error && <p className="text-red-300 text-sm">{error}</p>}
      <AssetGrid assets={filteredAssets} isLoading={isLoading} />
    </div>
  );
}
