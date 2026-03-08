"use client";

import { useCallback, useRef } from "react";
import { apiRequest } from "@/lib/api/client";
import {
  Asset,
  AssetCategory,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/lib/types";
import { useAppStore } from "@/lib/store/useAppStore";

export function useAssets(category?: AssetCategory) {
  const assets = useAppStore((s) => s.assets);
  const isLoading = useAppStore((s) => s.isLoading);
  const error = useAppStore((s) => s.error);

  const fetchIdRef = useRef(0);

  const fetchAssets = useCallback(async () => {
    const id = ++fetchIdRef.current;
    useAppStore.getState().setIsLoading(true);
    try {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      const data = await apiRequest<Asset[]>(`/api/assets${qs}`);
      if (fetchIdRef.current === id) {
        useAppStore.getState().setAssets(data || []);
        useAppStore.getState().setError(null);
      }
    } catch (err) {
      if (fetchIdRef.current === id) {
        useAppStore
          .getState()
          .setError(
            err instanceof Error ? err.message : "Failed to fetch assets",
          );
      }
    } finally {
      if (fetchIdRef.current === id) {
        useAppStore.getState().setIsLoading(false);
      }
    }
  }, [category]);

  const createAsset = useCallback(async (asset: CreateAssetInput) => {
    try {
      const created = await apiRequest<Asset>("/api/assets", {
        method: "POST",
        body: asset,
      });
      const currentAssets = useAppStore.getState().assets;
      useAppStore.getState().setAssets([created, ...currentAssets]);
    } catch (err) {
      useAppStore
        .getState()
        .setError(
          err instanceof Error ? err.message : "Failed to create asset",
        );
      throw err;
    }
  }, []);

  const updateAsset = useCallback(
    async (id: string, updates: UpdateAssetInput) => {
      try {
        await apiRequest<Asset>(`/api/assets/${id}`, {
          method: "PATCH",
          body: updates,
        });
        await fetchAssets();
      } catch (err) {
        useAppStore
          .getState()
          .setError(
            err instanceof Error ? err.message : "Failed to update asset",
          );
      }
    },
    [fetchAssets],
  );

  const deleteAsset = useCallback(async (id: string) => {
    try {
      await apiRequest<void>(`/api/assets/${id}`, { method: "DELETE" });
      const currentAssets = useAppStore.getState().assets;
      useAppStore
        .getState()
        .setAssets(currentAssets.filter((a) => a.id !== id));
    } catch (err) {
      useAppStore
        .getState()
        .setError(
          err instanceof Error ? err.message : "Failed to delete asset",
        );
    }
  }, []);

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  };
}
