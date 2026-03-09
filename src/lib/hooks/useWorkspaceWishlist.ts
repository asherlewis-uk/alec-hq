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
    const requestId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const wishlistItems = await apiRequest<WorkspaceWishlistItem[]>(
        "/api/workspace/wishlist",
      );
      if (fetchIdRef.current === requestId) {
        setWishlist(wishlistItems ?? []);
        setError(null);
      }
    } catch (error) {
      if (fetchIdRef.current === requestId) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch wishlist",
        );
      }
    } finally {
      if (fetchIdRef.current === requestId) {
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
