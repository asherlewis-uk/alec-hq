"use client";

import { type FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { WorkspaceSummary } from "@/lib/types";

function PinPad({
  length = 6,
  value,
  onDigitPress,
  onBackspace,
  disabled,
}: {
  length?: number;
  value: string;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label={`${length}-digit PIN`}
        aria-describedby="pin-entry-status"
        className={`flex justify-center gap-3${disabled ? " opacity-40" : ""}`}
      >
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;

          return (
            <div
              key={i}
              aria-hidden="true"
              className={`glass flex h-12 w-12 items-center justify-center rounded-full${filled ? " glass-accent" : ""}`}
            >
              <div
                className={`h-3.5 w-3.5 rounded-full transition-all duration-200${filled ? " bg-accent" : ""}`}
              />
            </div>
          );
        })}
      </div>

      <p id="pin-entry-status" className="sr-only">
        {value.length} of {length} digits entered.
      </p>

      <div
        role="group"
        aria-label="PIN keypad"
        className="grid grid-cols-3 gap-3"
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <Button
            key={digit}
            type="button"
            variant="outline"
            disabled={disabled || value.length >= length}
            onClick={() => onDigitPress(digit)}
            className="h-14 text-xl"
            aria-label={digit}
          >
            {digit}
          </Button>
        ))}

        <div aria-hidden="true" />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || value.length >= length}
          onClick={() => onDigitPress("0")}
          className="h-14 text-xl"
          aria-label="0"
        >
          0
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={disabled || value.length === 0}
          onClick={onBackspace}
          className="h-14 text-sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

const WORKSPACES: { slug: string; label: string }[] = [
  { slug: "asher", label: "Asher" },
  { slug: "alec", label: "Alec" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = selectedSlug !== null && pin.length === 6;

  const appendDigit = (digit: string) => {
    setPin((current) =>
      current.length >= 6 ? current : `${current}${digit.replace(/\D/g, "")}`,
    );
    setError(null);
  };

  const removeLastDigit = () => {
    setPin((current) => current.slice(0, -1));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await apiRequest<{ authenticated: boolean; workspace: WorkspaceSummary }>(
        "/api/auth/workspace/login",
        {
          method: "POST",
          body: { workspaceSlug: selectedSlug, pin },
        },
      );
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Incorrect workspace or PIN.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkspaceSelect = (workspaceSlug: string) => {
    setSelectedSlug(workspaceSlug);
    setPin("");
    setError(null);
  };

  const handleBack = () => {
    setSelectedSlug(null);
    setPin("");
    setError(null);
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-start justify-center px-4 pt-16 overflow-y-auto">
      <div className="glass rounded-glass w-full max-w-sm mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary">ALEC.HQ</h1>

        {selectedSlug === null ? (
          <>
            <p className="text-secondary mt-2">Select your workspace</p>
            <div className="mt-8 space-y-3">
              {WORKSPACES.map((ws) => (
                <button
                  key={ws.slug}
                  type="button"
                  onClick={() => handleWorkspaceSelect(ws.slug)}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-glass glass hover:glass-accent transition-all duration-200 text-left"
                >
                  <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                    {ws.label[0]}
                  </span>
                  <span className="text-primary font-medium">{ws.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-secondary mt-2">
              Enter PIN for{" "}
              <span className="text-primary font-medium">
                {WORKSPACES.find((w) => w.slug === selectedSlug)?.label}
              </span>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <PinPad
                value={pin}
                onDigitPress={appendDigit}
                onBackspace={removeLastDigit}
                disabled={isSubmitting}
              />

              {error && (
                <p className="glass glass-danger rounded-glass px-3 py-2 text-sm text-primary">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="flex-1"
                >
                  {isSubmitting ? "Unlocking..." : "Unlock"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
