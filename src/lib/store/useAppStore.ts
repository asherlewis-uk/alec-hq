import { create } from "zustand";
import type { Asset, WorkspaceSummary } from "@/lib/types";

interface AppStore {
  /* ── Workspace session ─────────────────────────────── */
  currentWorkspace: WorkspaceSummary | null;
  setCurrentWorkspace: (workspace: WorkspaceSummary | null) => void;

  /* ── Legacy (kept for backward-compat during transition) ── */
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  /* ── Global UI ─────────────────────────────────────── */
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentWorkspace: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  assets: [],
  setAssets: (assets) => set({ assets }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  updateAsset: (id, asset) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...asset } : a)),
    })),
  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
