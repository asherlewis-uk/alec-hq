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
      const id = ++fetchIdRef.current;
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts?.category) params.set("category", opts.category);
        if (opts?.search) params.set("search", opts.search);
        const qs = params.toString();
        const data = await apiRequest<CatalogAsset[]>(
          `/api/catalog/assets${qs ? `?${qs}` : ""}`,
        );
        if (fetchIdRef.current === id) {
          setAssets(data || []);
          setError(null);
        }
      } catch (err) {
        if (fetchIdRef.current === id) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch catalog assets",
          );
        }
      } finally {
        if (fetchIdRef.current === id) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  return { assets, isLoading, error, fetchAssets };
}
