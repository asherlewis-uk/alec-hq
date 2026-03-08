"use client";

import { ReactNode, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssets } from "@/lib/hooks/useAssets";
import { AssetCategory } from "@/lib/types";

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
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("RIG");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createAsset } = useAssets();
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createAsset({
        name,
        category,
        status: "ACTIVE",
        isPublic: false,
      });
      setName("");
      setCategory("RIG");
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create asset",
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
          <SheetTitle className="text-white">Add New Item</SheetTitle>
          <SheetDescription className="text-text-secondary">
            Create a new asset to start tracking
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium text-white">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lenovo Legion Go"
              className="mt-1 bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white">Category</label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as AssetCategory)}
            >
              <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/80 border-white/20">
                <SelectItem value="VEHICLE">🏍️ Vehicle</SelectItem>
                <SelectItem value="RIG">💻 PC Rig</SelectItem>
                <SelectItem value="PERIPHERAL">⌨️ Peripheral</SelectItem>
                <SelectItem value="NETWORK">🌐 Network</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-black rounded-glass"
          >
            {isSubmitting ? "Creating..." : "Create Asset"}
          </Button>
          {submitError && <p className="text-red-300 text-sm">{submitError}</p>}
        </form>
      </SheetContent>
    </Sheet>
  );
}
