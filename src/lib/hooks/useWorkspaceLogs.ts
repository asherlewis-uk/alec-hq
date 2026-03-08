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
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const data = await apiRequest<WorkspaceLog[]>("/api/workspace/logs");
      if (fetchIdRef.current === id) {
        setLogs(data || []);
        setError(null);
      }
    } catch (err) {
      if (fetchIdRef.current === id) {
        setError(err instanceof Error ? err.message : "Failed to fetch logs");
      }
    } finally {
      if (fetchIdRef.current === id) {
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
