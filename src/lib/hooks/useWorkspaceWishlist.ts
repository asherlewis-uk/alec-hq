"use client";

import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { WishlistPriority, WorkspaceWishlistItem } from "@/lib/types";

export interface CreateWorkspaceWishlistInput {
  catalogAssetId?: string | null;
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
}

export function useWorkspaceWishlist() {
  const [wishlist, setWishlist] = useState<WorkspaceWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchWishlist = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const data = await apiRequest<WorkspaceWishlistItem[]>(
        "/api/workspace/wishlist",
      );
      if (fetchIdRef.current === id) {
        setWishlist(data || []);
        setError(null);
      }
    } catch (err) {
      if (fetchIdRef.current === id) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch wishlist",
        );
      }
    } finally {
      if (fetchIdRef.current === id) {
        setIsLoading(false);
      }
    }
  }, []);

  const createItem = useCallback(
    async (input: CreateWorkspaceWishlistInput) => {
      const created = await apiRequest<WorkspaceWishlistItem>(
        "/api/workspace/wishlist",
        { method: "POST", body: input },
      );
      setWishlist((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  return { wishlist, isLoading, error, fetchWishlist, createItem };
}
