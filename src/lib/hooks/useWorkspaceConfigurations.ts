"use client";

import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { WorkspaceConfiguration } from "@/lib/types";

export interface CreateWorkspaceConfigurationInput {
  name: string;
  kind: string;
  notes?: string | null;
}

export function useWorkspaceConfigurations() {
  const [configurations, setConfigurations] = useState<
    WorkspaceConfiguration[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchConfigurations = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const data = await apiRequest<WorkspaceConfiguration[]>(
        "/api/workspace/configurations",
      );
      if (fetchIdRef.current === id) {
        setConfigurations(data || []);
        setError(null);
      }
    } catch (err) {
      if (fetchIdRef.current === id) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch configurations",
        );
      }
    } finally {
      if (fetchIdRef.current === id) {
        setIsLoading(false);
      }
    }
  }, []);

  const createConfiguration = useCallback(
    async (input: CreateWorkspaceConfigurationInput) => {
      const created = await apiRequest<WorkspaceConfiguration>(
        "/api/workspace/configurations",
        { method: "POST", body: input },
      );
      setConfigurations((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  return {
    configurations,
    isLoading,
    error,
    fetchConfigurations,
    createConfiguration,
  };
}
