"use client";

import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { LogType, WorkspaceLog } from "@/lib/types";

export interface CreateWorkspaceLogInput {
  workspaceAssetLinkId?: string | null;
  slotAssignmentId?: string | null;
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
}

export function useWorkspaceLogs() {
  const [logs, setLogs] = useState<WorkspaceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    const requestId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const workspaceLogs = await apiRequest<WorkspaceLog[]>(
        "/api/workspace/logs",
      );
      if (fetchIdRef.current === requestId) {
        setLogs(workspaceLogs ?? []);
        setError(null);
      }
    } catch (error) {
      if (fetchIdRef.current === requestId) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch logs",
        );
      }
    } finally {
      if (fetchIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const createLog = useCallback(async (input: CreateWorkspaceLogInput) => {
    const created = await apiRequest<WorkspaceLog>("/api/workspace/logs", {
      method: "POST",
      body: input,
    });
    setLogs((prev) => [created, ...prev]);
    return created;
  }, []);

  return { logs, isLoading, error, fetchLogs, createLog };
}
