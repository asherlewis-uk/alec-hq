"use client";

import { FormEvent, Suspense, useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { WorkspaceSummary } from "@/lib/types";

function PinInput({
  length = 6,
  value,
  onChange,
  disabled,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback(
    (i: number) => {
      if (i >= 0 && i < length) refs.current[i]?.focus();
    },
    [length],
  );

  const handleChange = (i: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split("");
    arr[i] = char;
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (char && i < length - 1) focusIndex(i + 1);
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      focusIndex(i - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      onChange(pasted);
      focusIndex(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={i === 0}
          className="w-12 h-14 text-center text-2xl font-mono rounded-glass bg-white/10 border border-white/20 text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors disabled:opacity-40"
          aria-label={`PIN digit ${i + 1}`}
        />
      ))}
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

  const handleBack = () => {
    setSelectedSlug(null);
    setPin("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-center justify-center px-4">
      <div className="glass rounded-glass w-full max-w-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-primary">ALEC.HQ</h1>

        {selectedSlug === null ? (
          <>
            <p className="text-secondary mt-2">Select your workspace</p>
            <div className="mt-8 space-y-3">
              {WORKSPACES.map((ws) => (
                <button
                  key={ws.slug}
                  type="button"
                  onClick={() => setSelectedSlug(ws.slug)}
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
              <PinInput value={pin} onChange={setPin} disabled={isSubmitting} />

              {error && <p className="text-sm text-red-300">{error}</p>}

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
        <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
