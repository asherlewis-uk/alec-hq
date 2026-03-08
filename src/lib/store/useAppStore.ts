import { create } from "zustand";
import type { WorkspaceSummary } from "@/lib/types";

interface AppStore {
  /* ── Workspace session ─────────────────────────────── */
  currentWorkspace: WorkspaceSummary | null;
  setCurrentWorkspace: (workspace: WorkspaceSummary | null) => void;

  /* ── Global UI ─────────────────────────────────────── */
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentWorkspace: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
