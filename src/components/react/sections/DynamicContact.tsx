// src/components/react/sections/DynamicContact.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import FadeIn from "@/components/react/FadeIn";
import ContactForm from "@/components/react/ContactForm";
import { Card } from "@/components/ui/card";
import ReactIcon from "@/components/react/ReactIcon";

interface SocialLink {
  platform: string;
  url: string;
}

interface PersonalInfo {
  email: string;
  socials: SocialLink[];
}

const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: "GitHub", url: "https://github.com/code-with-zeeshan" },
  { platform: "LinkedIn", url: "https://linkedin.com/in/mohammad-zeeshan-37637a1a5" },
];

const STATIC_FALLBACK: PersonalInfo = {
  email: "you@email.com",
  socials: DEFAULT_SOCIALS,
};

const ALL_PLATFORMS = [
  "GitHub", "LinkedIn", "X", "Instagram", "Facebook", "YouTube", "TikTok",
  "Reddit", "Pinterest", "Discord", "Telegram", "WhatsApp", "Medium", 
  "DEV.to", "StackOverflow", "CodePen", "Dribbble", "Behance", "Figma", "Slack"
];

const MIN_TOTAL = 3;
const MAX_TOTAL = 5;

const ICON_MAP: Record<string, string> = {
  github: "github",
  linkedin: "linkedin",
  x: "x",
  twitter: "x",
  instagram: "instagram",
  facebook: "facebook",
  youtube: "youtube",
  tiktok: "tiktok",
  reddit: "reddit",
  pinterest: "pinterest",
  discord: "discord",
  telegram: "telegram",
  whatsapp: "whatsapp",
  medium: "medium",
  devto: "devto",
  stackoverflow: "stackoverflow",
  codepen: "codepen",
  dribbble: "dribbble",
  behance: "behance",
  figma: "figma",
  slack: "slack",
};

export default function DynamicContact() {
  const [data, setData] = useState<PersonalInfo>(STATIC_FALLBACK);
  const [editable, setEditable] = useState(false);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showMaxDialog, setShowMaxDialog] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setShowLogin(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    supabase
      .from("personal")
      .select("email, socials")
      .limit(1)
      .single()
      .then(({ data: row, error }) => {
        if (!error && row) {
          let socials = row.socials || DEFAULT_SOCIALS;
          const totalItems = 1 + socials.length;
          if (totalItems > MAX_TOTAL) {
            socials = socials.slice(0, MAX_TOTAL - 1);
          }
          while ((1 + socials.length) < MIN_TOTAL) {
            const existingPlatforms = socials.map((s: SocialLink) => s.platform.toLowerCase());
            const available = ALL_PLATFORMS.filter(p => !existingPlatforms.includes(p.toLowerCase()));
            if (available.length > 0) {
              socials.push({ platform: available[0], url: "" });
            } else {
              break;
            }
          }
          const email = row.email || "you@email.com";
          setData({ email, socials });
        }
      });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s && localStorage.getItem("openContactEdit") === "true") {
        localStorage.removeItem("openContactEdit");
        setEditable(true);
      } else if (s && localStorage.getItem("contactEditSaved") === "true") {
        localStorage.removeItem("contactEditSaved");
        setEditable(true);
      }
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const usedPlatforms = (data.socials || []).map(s => s.platform.toLowerCase());
  const availablePlatforms = ALL_PLATFORMS.filter(
    p => !usedPlatforms.includes(p.toLowerCase())
  );

  const handlePlatformChange = async (idx: number, newPlatform: string) => {
    const updated = [...data.socials];
    updated[idx] = { ...updated[idx], platform: newPlatform, url: "" };
    setData({ ...data, socials: updated });
    setShowDropdown(null);
    
    if (session) {
      await supabase.from("personal").update({ socials: updated }).eq("id", session.user.id);
    }
  };

  const handleUrlChange = async (idx: number, url: string) => {
    const updated = [...data.socials];
    updated[idx] = { ...updated[idx], url };
    setData({ ...data, socials: updated });
    
    if (session) {
      await supabase.from("personal").update({ socials: updated }).eq("id", session.user.id);
    }
  };

  const handleEmailChange = async (email: string) => {
    setData({ ...data, email });
    if (session) {
      await supabase.from("personal").update({ email }).eq("id", session.user.id);
    }
  };

  const addHandle = async () => {
    const totalItems = 1 + data.socials.length;
    if (totalItems >= MAX_TOTAL) {
      setShowMaxDialog(true);
      return;
    }
    if (availablePlatforms.length === 0) return;
    const newPlatform = availablePlatforms[0];
    const updated = [...data.socials, { platform: newPlatform, url: "" }];
    setData({ ...data, socials: updated });
    
    if (session) {
      await supabase.from("personal").update({ socials: updated }).eq("id", session.user.id);
    }
  };

  const removeHandle = async (idx: number) => {
    const totalItems = 1 + data.socials.length;
    if (totalItems <= MIN_TOTAL) return;
    const updated = data.socials.filter((_, i) => i !== idx);
    setData({ ...data, socials: updated });
    
    if (session) {
      await supabase.from("personal").update({ socials: updated }).eq("id", session.user.id);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
      return;
    }

    if (authData.session) {
      setSession(authData.session);
      setShowLogin(false);
      setEditable(true);
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEditable(false);
    setShowExitConfirm(false);
  };

  const getHandleDisplay = (url: string, platform: string) => {
    if (!url) return "Not set";
    const p = platform.toLowerCase();
    let handle = "";
    
    if (p === "github" || p === "x" || p === "twitter" || p === "instagram" || p === "tiktok") {
      handle = "@" + url.replace(/https?:\/\/(www\.)?(github\.com|x\.com|twitter\.com|instagram\.com|tiktok\.com)\//, "").replace(/\/$/, "");
    } else if (p === "linkedin") {
      handle = url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "");
    } else if (p === "whatsapp") {
      handle = url.replace(/https?:\/\/(www\.)?wa\.me\//, "").replace(/\/$/, "");
    } else if (p === "telegram") {
      handle = "@" + url.replace(/https?:\/\/(www\.)?t\.me\//, "").replace(/\/$/, "");
    } else {
      handle = url.replace(/https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    }
    return handle || "Not set";
  };

  const getIconName = (platform: string): string => {
    const key = platform.toLowerCase();
    return ICON_MAP[key] || "user";
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-zinc-100 dark:bg-zinc-900/50" style={{ contentVisibility: "auto", containIntrinsicSize: "0 700px" }}>
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-10 md:mb-16 text-center relative">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">
              Get in Touch
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
              Let's Work Together
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-zinc-600 dark:text-zinc-400">
              Have a project in mind? I'd love to hear about it. Drop me a message
              and I'll get back to you within 24 hours.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12">
          <FadeIn direction="left" className="lg:col-span-4 min-w-0">
            <div className="space-y-6" ref={dropdownRef}>
              {editable && session ? (
                <div className="space-y-3">
                  {/* Email - editable with dropdown, counted in the 5 limit */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                      <ReactIcon name="mail" size={18} />
                    </div>
                    <div className="flex-1 relative">
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(showDropdown === -1 ? null : -1)}
                          className="text-sm text-zinc-500 hover:text-brand-500 flex items-center gap-1 font-medium"
                        >
                          Email
                          <ReactIcon name="chevron-down" size={12} />
                        </button>
                        {showDropdown === -1 && (
                          <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-40 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-zinc-400 cursor-not-allowed"
                              disabled
                            >
                              Email (fixed)
                            </button>
                          </div>
                        )}
                      </div>
                      <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs leading-tight dark:border-zinc-700 dark:bg-zinc-800"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Social handles */}
                  {data.socials.map((social, idx) => {
                    const iconName = getIconName(social.platform);
                    const isLast = idx === data.socials.length - 1;
                    
                    const totalItems = 1 + data.socials.length;
                    const showPlus = isLast && totalItems === 3;
                    const showBoth = isLast && totalItems === 4;
                    const showRemove = isLast && totalItems === 5;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                          <ReactIcon name={iconName} size={18} />
                        </div>
                        <div className="flex-1 relative">
                          <div className="flex items-center gap-1 mb-1">
                            <button
                              type="button"
                              onClick={() => setShowDropdown(showDropdown === idx ? null : idx)}
                              className="text-sm text-zinc-500 hover:text-brand-500 flex items-center gap-1 font-medium"
                            >
                              {social.platform}
                              <ReactIcon name="chevron-down" size={12} />
                            </button>
                            {showDropdown === idx && (
                              <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-40 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                {availablePlatforms.map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => handlePlatformChange(idx, p)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => handleUrlChange(idx, e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            placeholder="https://..."
                          />
                        </div>
                        {showPlus && (
                          <button
                            type="button"
                            onClick={addHandle}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-brand-500 hover:text-brand-500"
                            title="Add new handle"
                          >
                            <ReactIcon name="plus" size={16} />
                          </button>
                        )}
                        {showBoth && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={addHandle}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-brand-500 hover:text-brand-500"
                              title="Add new handle"
                            >
                              <ReactIcon name="plus" size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeHandle(idx)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-red-500 hover:text-red-500"
                              title="Remove handle"
                            >
                              <ReactIcon name="x-close" size={16} />
                            </button>
                          </div>
                        )}
                        {showRemove && (
                          <button
                            type="button"
                            onClick={() => removeHandle(idx)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-red-500 hover:text-red-500"
                            title="Remove handle"
                          >
                            <ReactIcon name="x-close" size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                      <ReactIcon name="mail" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
                      <a
                        href={`mailto:${data.email}`}
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:text-brand-500 transition-colors break-all"
                      >
                        {data.email}
                      </a>
                    </div>
                  </div>

                  {data.socials.map((social, idx) => {
                    const iconName = getIconName(social.platform);
                    const handle = getHandleDisplay(social.url, social.platform);

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                          <ReactIcon name={iconName} size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{social.platform}</p>
                          {social.url ? (
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:text-brand-500 transition-colors"
                            >
                              {handle}
                            </a>
                          ) : (
                            <span className="text-sm text-zinc-400">Not set</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Quick Response
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      I typically respond within 24 hours. For urgent inquiries,
                      please mention it in your message.
                    </p>
                  </div>
                </>
              )}
            </div>
          </FadeIn>

          <FadeIn direction="right" className="lg:col-span-8">
            <Card variant="bordered" className="bg-white dark:bg-zinc-900 p-8 rounded-2xl">
              <ContactForm />
            </Card>
          </FadeIn>
        </div>
      </div>

      {editable && (
        <div className="fixed top-6 right-6 z-40 flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem("contactEditSaved", "true");
              setShowSaveConfirm(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:border-green-500 bg-white dark:bg-zinc-800 dark:border-zinc-700"
          >
            Save
          </button>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 border border-zinc-200 rounded-lg hover:border-red-500 bg-white dark:bg-zinc-800 dark:border-zinc-700"
          >
            Exit
          </button>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 bg-white p-8 shadow-2xl dark:bg-zinc-900 rounded-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sign in to Edit</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Press Ctrl+Shift+C to edit contact</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="admin@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="••••••••"
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
          </Card>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 bg-white p-6 dark:bg-zinc-900 rounded-2xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Exit Edit Mode?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Do you also want to log out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Logout & Exit
              </button>
            </div>
          </Card>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 bg-white p-6 dark:bg-zinc-900 rounded-2xl">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <ReactIcon name="check-circle" size={24} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Edit Mode Saved!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Your contact edit mode will persist even after refresh.
              </p>
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="w-full rounded-lg bg-green-500 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                OK
              </button>
            </div>
          </Card>
        </div>
      )}

      {showMaxDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 bg-white p-6 dark:bg-zinc-900 rounded-2xl">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <ReactIcon name="alert" size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Maximum Handles Reached</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                You can only have {MAX_TOTAL} items (including email). Remove one to add another.
              </p>
              <button
                onClick={() => setShowMaxDialog(false)}
                className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                OK
              </button>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}