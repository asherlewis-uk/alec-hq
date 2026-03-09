"use client";

import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type {
  AssetStatus,
  CatalogAsset,
  WorkspaceAssetLink,
} from "@/lib/types";

export interface WorkspaceAssetView {
  link: WorkspaceAssetLink;
  catalogAsset: CatalogAsset | null;
}

export function useWorkspaceAssets() {
  const [assets, setAssets] = useState<WorkspaceAssetView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchAssets = useCallback(async () => {
    const requestId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const workspaceAssets = await apiRequest<WorkspaceAssetView[]>(
        "/api/workspace/assets",
      );
      if (fetchIdRef.current === requestId) {
        setAssets(workspaceAssets ?? []);
        setError(null);
      }
    } catch (error) {
      if (fetchIdRef.current === requestId) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch workspace assets",
        );
      }
    } finally {
      if (fetchIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const createAssetLink = useCallback(
    async (input: {
      catalogAssetId: string;
      localStatus: AssetStatus;
      notes?: string | null;
    }) => {
      const created = await apiRequest<WorkspaceAssetView>(
        "/api/workspace/assets",
        { method: "POST", body: input },
      );
      setAssets((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateAssetLink = useCallback(
    async (
      id: string,
      updates: Partial<Pick<WorkspaceAssetLink, "localStatus" | "notes">>,
    ) => {
      const updated = await apiRequest<WorkspaceAssetView>(
        `/api/workspace/assets/${id}`,
        { method: "PATCH", body: updates },
      );
      setAssets((prev) =>
        prev.map((assetView) =>
          assetView.link.id === id ? updated : assetView,
        ),
      );
      return updated;
    },
    [],
  );

  const deleteAssetLink = useCallback(async (id: string) => {
    await apiRequest<void>(`/api/workspace/assets/${id}`, {
      method: "DELETE",
    });
    setAssets((prev) => prev.filter((assetView) => assetView.link.id !== id));
  }, []);

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
    createAssetLink,
    updateAssetLink,
    deleteAssetLink,
  };
}
