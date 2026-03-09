"use client";

import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { AssetCategory, CatalogAsset } from "@/lib/types";

export function useCatalogAssets() {
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchAssets = useCallback(
    async (opts?: { category?: AssetCategory; search?: string }) => {
      const requestId = ++fetchIdRef.current;
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts?.category) params.set("category", opts.category);
        if (opts?.search) params.set("search", opts.search);
        const qs = params.toString();
        const catalogAssets = await apiRequest<CatalogAsset[]>(
          `/api/catalog/assets${qs ? `?${qs}` : ""}`,
        );
        if (fetchIdRef.current === requestId) {
          setAssets(catalogAssets ?? []);
          setError(null);
        }
      } catch (error) {
        if (fetchIdRef.current === requestId) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch catalog assets",
          );
        }
      } finally {
        if (fetchIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  return { assets, isLoading, error, fetchAssets };
}
