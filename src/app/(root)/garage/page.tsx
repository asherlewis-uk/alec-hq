"use client";

import {
  useWorkspaceAssets,
  WorkspaceAssetView,
} from "@/lib/hooks/useWorkspaceAssets";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { useEffect, useMemo } from "react";
import type { Asset } from "@/lib/types";

function toAsset(view: WorkspaceAssetView): Asset {
  const catalogAsset = view.catalogAsset;
  return {
    id: catalogAsset?.id ?? view.link.catalogAssetId,
    name: catalogAsset?.name ?? "Unnamed asset",
    category: catalogAsset?.category ?? "VEHICLE",
    status: view.link.localStatus,
    coverImage: catalogAsset?.coverImage ?? null,
    isPublic: catalogAsset?.isPublic ?? false,
    createdAt: view.link.createdAt,
    updatedAt: view.link.updatedAt,
  };
}

export default function GaragePage() {
  const { assets, isLoading, error, fetchAssets } = useWorkspaceAssets();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const filteredAssets = useMemo(
    () =>
      assets
        .filter((assetView) => assetView.catalogAsset?.category === "VEHICLE")
        .map(toAsset),
    [assets],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">🏍️ The Garage</h1>
      {error && <p className="text-red-300 text-sm">{error}</p>}
      <AssetGrid assets={filteredAssets} isLoading={isLoading} />
    </div>
  );
}
