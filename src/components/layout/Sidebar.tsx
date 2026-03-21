"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Zap,
  Cpu,
  Settings,
  Star,
  ClipboardList,
} from "lucide-react";
import { designMarker } from "@/lib/design/classes";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/store/useAppStore";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/catalog", label: "Catalog", icon: BookOpen },
  { href: "/garage", label: "The Garage", icon: Zap },
  { href: "/rig", label: "The Rig", icon: Cpu },
  {
    href: "/workspace/configurations",
    label: "Configurations",
    icon: Settings,
  },
  { href: "/workspace/wishlist", label: "Wishlist", icon: Star },
  { href: "/workspace/logs", label: "Logs", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const workspace = useAppStore((s) => s.currentWorkspace);

  return (
    <div {...designMarker("Sidebar")} className="flex flex-col h-full p-6 bg-black/20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
          ALEC
        </h1>
        <p className="text-xs text-secondary mt-1">Command Center</p>
      </motion.div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-glass transition-all duration-200",
                  isActive ? "glass-accent" : "hover:glass",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-accent" : "text-secondary",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : "text-secondary",
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-6 border-t border-white/10"
      >
        {workspace && (
          <p className="text-xs text-accent font-medium mb-2">
            {workspace.name}
          </p>
        )}
        <p className="text-xs text-muted">ALEC.HQ v2.0</p>
      </motion.div>
    </div>
  );
}
