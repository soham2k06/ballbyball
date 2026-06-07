"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";

import { login } from "./actions";

export default function AdminLogin() {
  const router = useRouter();
  const [pwInput, setPwInput] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(pwInput);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold tracking-tight">Admin Access</h1>
        <div className="relative">
          <Input
            type={pwVisible ? "text" : "password"}
            placeholder="Password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setPwVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            {pwVisible ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pwInput}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
