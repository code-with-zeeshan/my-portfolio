// src/components/react/AdminGate.tsx
// Invisible component that listens for Ctrl+Shift+A to open admin login
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Detect if device is mobile/touch device
function isMobile(): boolean {
  return typeof window !== "undefined" && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
}

export default function AdminGate() {
  const [showLogin, setShowLogin] = useState(false);
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A (or Cmd+Shift+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        // Check device type at event time
        if (isMobile()) {
          setShowMobilePrompt(true);
        } else {
          setShowLogin(true);
        }
      }
      // Escape to close
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowMobilePrompt(false);
        setError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);  // Empty deps - isMobile() is called at event time instead

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Store session and redirect to admin
        window.location.href = "/admin";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // Mobile prompt when trying to access admin on touch device
  if (showMobilePrompt) {
    return (
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={() => setShowMobilePrompt(false)}
      >
        <Card className="w-full max-w-sm bg-white p-6 shadow-2xl dark:bg-zinc-900 rounded-2xl">
          <div className="text-center mb-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Desktop Recommended</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Admin features work best on desktop. On mobile, use a browser keyboard with Ctrl+Shift+A to access login.
            </p>
          </div>
          <button
            onClick={() => setShowMobilePrompt(false)}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Got it
          </button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showLogin && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
              setError("");
            }
          }}
        >
          <Card className="w-full max-w-md mx-4 bg-white p-8 shadow-2xl dark:bg-zinc-900 rounded-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Admin Access</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign in to manage your portfolio</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="admin@email.com"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
                 <Input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="bg-zinc-50 transition-all focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                   placeholder="••••••••"
                 />
               </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => { setShowLogin(false); setError(""); }}
              className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Cancel (Esc)
            </button>
          </Card>
        </div>
      )}
    </>
  );
}