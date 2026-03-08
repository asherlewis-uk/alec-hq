"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { apiRequest } from "@/lib/api/client";
import { useAppStore } from "@/lib/store/useAppStore";
import type { WorkspaceSummary } from "@/lib/types";

interface AppShellProps {
  children: ReactNode;
}

interface SessionResponse {
  authenticated: boolean;
  role?: string;
  workspace?: WorkspaceSummary;
}

export function AppShell({ children }: AppShellProps) {
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    apiRequest<SessionResponse>("/api/auth/session")
      .then((data) => {
        if (data.workspace) {
          setCurrentWorkspace(data.workspace);
        }
      })
      .catch(() => {
        // Session fetch failure is non-fatal — proxy handles redirects
      });
  }, [setCurrentWorkspace]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-white/10 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-white/10 backdrop-blur-sm">
          <TopBar />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
