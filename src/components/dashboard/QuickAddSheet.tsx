"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useCatalogAssets } from "@/lib/hooks/useCatalogAssets";
import { useWorkspaceAssets } from "@/lib/hooks/useWorkspaceAssets";
import type { CatalogAsset } from "@/lib/types";
import { getCategoryEmoji } from "@/lib/utils/formatters";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function QuickAddSheet({
  open,
  onOpenChange,
  children,
}: QuickAddSheetProps) {
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { assets: catalogAssets, fetchAssets: fetchCatalog } =
    useCatalogAssets();
  const { createAssetLink } = useWorkspaceAssets();
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      fetchCatalog({ search: search || undefined });
    }
  }, [open, search, fetchCatalog]);

  const handleLink = async (asset: CatalogAsset) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createAssetLink({
        catalogAssetId: asset.id,
        localStatus: "ACTIVE",
      });
      setSearch("");
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to link asset",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
      <SheetContent className="bg-gradient-to-b from-white/10 to-white/5 border-white/20">
        <SheetHeader>
          <SheetTitle className="text-white">Link Catalog Asset</SheetTitle>
          <SheetDescription className="text-text-secondary">
            Search the catalog and link an asset to your workspace
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Input
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-text-muted"
          />

          {submitError && <p className="text-red-300 text-sm">{submitError}</p>}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {catalogAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleLink(asset)}
                className="w-full flex items-center gap-3 p-3 rounded-glass glass hover:bg-white/10 transition-colors text-left disabled:opacity-50"
              >
                <span className="text-xl">
                  {getCategoryEmoji(asset.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {asset.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {asset.category}
                    {asset.manufacturer ? ` · ${asset.manufacturer}` : ""}
                  </p>
                </div>
              </button>
            ))}
            {catalogAssets.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">
                No catalog assets found
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
