"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  CheckCircle2,
  Chrome,
  MonitorSmartphone,
  Plus,
  Share2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { designMarker } from "@/lib/design/classes";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type DevicePlatform = "ios" | "android" | "desktop";

interface PwaInstallGateProps {
  children: ReactNode;
}

function detectPlatform(userAgent: string): DevicePlatform {
  const normalizedUserAgent = userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(normalizedUserAgent);
  const isAndroidDevice = /android/.test(normalizedUserAgent);

  if (isIosDevice) {
    return "ios";
  }

  if (isAndroidDevice) {
    return "android";
  }

  return "desktop";
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function PwaInstallGate({ children }: PwaInstallGateProps) {
  const [platform, setPlatform] = useState<DevicePlatform>("desktop");
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPromptPending, setIsPromptPending] = useState(false);

  useEffect(() => {
    const standaloneMediaQuery = window.matchMedia(
      "(display-mode: standalone)",
    );
    const fullscreenMediaQuery = window.matchMedia(
      "(display-mode: fullscreen)",
    );

    const syncStandaloneState = () => {
      setIsStandalone(isStandaloneMode());
    };

    setPlatform(detectPlatform(navigator.userAgent));
    syncStandaloneState();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsStandalone(true);
    };

    standaloneMediaQuery.addEventListener("change", syncStandaloneState);
    fullscreenMediaQuery.addEventListener("change", syncStandaloneState);
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      standaloneMediaQuery.removeEventListener("change", syncStandaloneState);
      fullscreenMediaQuery.removeEventListener("change", syncStandaloneState);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    setIsPromptPending(true);

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === "accepted") {
        setInstallPromptEvent(null);
      }
    } finally {
      setIsPromptPending(false);
      setIsStandalone(isStandaloneMode());
    }
  };

  const handleRefreshStandaloneState = () => {
    setIsStandalone(isStandaloneMode());
  };

  if (isStandalone === null) {
    return null;
  }

  if (isStandalone) {
    return <>{children}</>;
  }

  const showInstallButton =
    platform === "android" && installPromptEvent !== null;

  return (
    <div
      {...designMarker("PwaInstallGate")}
      className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
        <section className="glass w-full rounded-[28px] border border-white/15 p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Installed App Required
              </p>
              <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
                Open ALEC.HQ as an app.
              </h1>
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 p-3 text-accent">
              <MonitorSmartphone className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-5 text-base leading-7 text-secondary">
            Browser access is disabled. Add ALEC.HQ to your home screen, then
            launch it from the installed app icon so it opens in standalone
            mode.
          </p>

          <div className="mt-6 rounded-[22px] border border-accent/30 bg-accent/10 p-4 text-sm text-primary">
            Status: browser mode detected. This session stays blocked until
            ALEC.HQ is opened from its installed app icon.
          </div>

          {platform === "ios" && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-primary">
                <Share2 className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">iPhone / iPad steps</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-secondary">
                <li>1. Open this site in Safari.</li>
                <li>2. Tap the Share button.</li>
                <li>3. Choose Add to Home Screen.</li>
                <li>4. Open ALEC.HQ from the new home screen icon.</li>
              </ol>
            </div>
          )}

          {platform === "android" && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-primary">
                <Chrome className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Android steps</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-secondary">
                <li>1. Use Chrome or another install-capable browser.</li>
                <li>2. Tap Install App or open the browser menu.</li>
                <li>3. Choose Install app or Add to Home screen.</li>
                <li>4. Open ALEC.HQ from your launcher or home screen.</li>
              </ol>
            </div>
          )}

          {platform === "desktop" && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-primary">
                <Smartphone className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">
                  Desktop or unsupported browser
                </h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-secondary">
                ALEC.HQ is locked to installed app mode. Install it from a
                PWA-capable browser, or open this URL on iPhone Safari or
                Android Chrome and add it to the home screen first.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {showInstallButton && (
              <Button
                onClick={handleInstall}
                disabled={isPromptPending}
                className="h-12 rounded-[18px]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isPromptPending ? "Waiting for install..." : "Install App"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleRefreshStandaloneState}
              className="h-12 rounded-[18px]"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />I Opened the Installed
              App
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
