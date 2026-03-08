"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddSheet } from "@/components/dashboard/QuickAddSheet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api/client";

const pathLabels: Record<string, string> = {
  "/": "Dashboard",
  "/catalog": "Catalog",
  "/garage": "The Garage",
  "/rig": "The Rig",
  "/workspace/configurations": "Configurations",
  "/workspace/wishlist": "Wishlist",
  "/workspace/logs": "Logs",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getLabel = () => {
    if (pathname.startsWith("/garage/")) return "Vehicle Details";
    if (pathname.startsWith("/rig/")) return "Rig Details";
    if (pathname.startsWith("/workspace/"))
      return pathLabels[pathname] || "Workspace";
    return pathLabels[pathname] || "ALEC.HQ";
  };

  return (
    <div className="flex items-center justify-between p-4 md:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold text-white">{getLabel()}</h2>
      </motion.div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoggingOut}
          onClick={async () => {
            setIsLoggingOut(true);
            try {
              await apiRequest("/api/auth/logout", { method: "POST" });
              router.replace("/login");
              router.refresh();
            } finally {
              setIsLoggingOut(false);
            }
          }}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
        <QuickAddSheet open={isOpen} onOpenChange={setIsOpen}>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-accent hover:bg-accent/90 text-black rounded-glass"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </QuickAddSheet>
      </div>
    </div>
  );
}
