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
    const requestId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const workspaceConfigurations = await apiRequest<
        WorkspaceConfiguration[]
      >("/api/workspace/configurations");
      if (fetchIdRef.current === requestId) {
        setConfigurations(workspaceConfigurations ?? []);
        setError(null);
      }
    } catch (error) {
      if (fetchIdRef.current === requestId) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch configurations",
        );
      }
    } finally {
      if (fetchIdRef.current === requestId) {
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
