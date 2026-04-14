// src/components/react/AdminDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type {
  TopSkill,
  Highlight,
  PersonalInfo,
  Project,
  SkillCategory,
  Experience,
  BlogPost,
  Testimonial,
  Message,
  Resume,
} from "@/lib/types";
import CloudinaryUpload from "@/components/react/CloudinaryUpload";
import CloudinaryMultiUpload from "@/components/react/CloudinaryMultiUpload";
import MarkdownEditor from "@/components/react/MarkdownEditor";
import BlogPreviewModal from "@/components/react/BlogPreviewModal";
import AnalyticsDisplay from "@/components/react/AnalyticsDisplay";
import { setAnalyticsProvider, type AnalyticsProvider } from "@/components/react/AnalyticsProvider";
// import { string } from "astro:schema";
import {
  isoToDatetimeLocal,
  datetimeLocalToIso,
  getUserTimezoneLabel,
  formatScheduledDate,
} from "@/lib/datetime";
import ImageCropUpload from "@/components/react/ImageCropUpload";
import ReactIcon from "@/components/react/ReactIcon";
import ProjectPreviewModal from "@/components/react/ProjectPreviewModal";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
 
// ─── Default values ───
const DEFAULT_TOP_SKILLS: TopSkill[] = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript",       level: 90 },
  { name: "Node.js",          level: 85 },
  { name: "Tailwind CSS",     level: 92 },
  { name: "PostgreSQL",       level: 78 },
];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { icon: "briefcase", label: "Years Experience",   value: "5+"  },
  { icon: "calendar",  label: "Projects Completed", value: "30+" },
  { icon: "coffee",    label: "Cups of Coffee",     value: "∞"   },
  { icon: "heart",     label: "Happy Clients",      value: "20+" },
];

// Converts array to textarea string for display
const achievementsToText = (arr: string[]) => arr.join("\n");

// Converts textarea string to array — only cleans up on save, not on type
const textToAchievements = (text: string) =>
  text.split("\n").map((a) => a.trim()).filter(Boolean);

type Tab = "personal" | "projects" | "skills" | "experience" | "blog" | "testimonials" | "messages" | "resume" | "analytics";

function TagInput({
  value,
  onChange,
  placeholder = "Type a skill and press Enter or comma...",
}: {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();  // prevents leaking to textarea siblings
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) addTag(inputValue);
  };

  return (
    <div className="min-h-[44px] flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 rounded-full hover:bg-brand-500/20 p-0.5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : "Add more..."}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400"
      />
    </div>
  );
}

// ─── Reusable Input Component ───
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function CronSecretGenerator() {
  const [secret,    setSecret]    = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSecret(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/generate-secret", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSecret(json.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
      >
        {loading ? "Generating..." : "Generate New Secret"}
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {secret && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
            <code className="flex-1 text-xs font-mono text-zinc-900 dark:text-zinc-50 break-all select-all">
              {secret}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
              ⚠️ Add this to:
            </p>
            <ol className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5 list-decimal list-inside">
              <li>Your <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env</code> file: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">CRON_SECRET={"<secret>"}</code></li>
              <li>Vercel → Project → Settings → Environment Variables</li>
              <li>GitHub → Repo → Settings → Secrets → Actions</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; synced: string[]; errors: string[] } | null>(null);
  const inputCls = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
  const btnPrimary = "rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 dark:bg-zinc-50 dark:text-zinc-900 transition-colors";
  const btnDanger = "rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors";
  const btnAdd = "rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors";

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_tab");
      if (saved && ["personal", "projects", "skills", "experience", "blog", "testimonials", "messages", "resume", "analytics"].includes(saved)) {
        return saved as Tab;
      }
    }
    return "personal";
  });
  const [loading, setLoading] = useState(true);
  const [analyticsProvider, setAnalyticsProviderState] = useState<AnalyticsProvider>("vercel");
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingHighlights, setSavingHighlights] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  
  // ─── State declarations ───
  type AuthState = "checking" | "returning" | "authenticated" | "unauthenticated";
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") return "checking";
    const key = Object.keys(localStorage).find(
      (k) => k.includes("auth") && (k.includes("supabase") || k.startsWith("sb-"))
    );
    return key ? "returning" : "checking";
  });
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  // Sidebar collapse/expand
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Jump list visibility
  const [jumpListOpen, setJumpListOpen] = useState(true);

  // Bio fullscreen modal
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Data
  const [personal, setPersonal] = useState<PersonalInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeData, setResumeData] = useState<Resume | null>(null);

  useEffect(() => {
    // ── Detect returning user SYNCHRONOUSLY before any async work ──
    // localStorage is safe here — this runs client-side only
    const sessionKey = Object.keys(localStorage).find(
      (key) => key.includes("auth") && (key.includes("supabase") || key.startsWith("sb-"))
    );
    
    // If we found a session token, show "Loading admin panel" immediately
    // instead of waiting for async getSession() to complete
    if (sessionKey) {
      setAuthState("returning");
    } else {
      // No session found, start with checking state
      setAuthState("checking");
    }
  
    // ── Now verify the session is actually valid ──
    // Add timeout to prevent getting stuck in "returning" state
    const timeoutId = setTimeout(() => {
      // If still in returning after 5s, auth check failed - go to unauthenticated
      if (authState === "returning") {
        setAuthState("unauthenticated");
        window.location.href = "/";
      }
    }, 5000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeoutId);
      if (error || !session) {
        // No valid session → redirect home
        setAuthState("unauthenticated");
        window.location.href = "/";
        return;
      }
      // Valid session confirmed
      setUser(session.user);
      setAuthState("authenticated");
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeoutId);
      setAuthState("unauthenticated");
      window.location.href = "/";
    });
  }, []);

  // ─── Notification ───
  const notify = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ─── Load Data ───
  const loadData = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "personal": {
          const { data, error } = await supabase
            .from("personal")
            .select("*")
            .limit(1)
            .single();
        
          if (!error && data) {
            // console.log("Loaded personal data:", data);
        
            setPersonal({
              id:               data.id,
              name:             data.name             ?? "",
              title:            data.title            ?? "",
              tagline:          data.tagline          ?? "",
              bio:              data.bio              ?? "",
              location:         data.location         ?? "",
              email:            data.email            ?? "",
              availability:     data.availability     ?? "",
              github_url:       data.github_url       ?? null,
              linkedin_url:     data.linkedin_url     ?? null,
              twitter_url:      data.twitter_url      ?? null,
              profile_photo_url: data.profile_photo_url ?? null,
              updated_at:        data.updated_at      ?? new Date().toISOString(),
              // ✅ Safely parse JSONB — handle null, empty array, invalid data
              top_skills: Array.isArray(data.top_skills) && data.top_skills.length > 0
                ? data.top_skills
                : DEFAULT_TOP_SKILLS,
              highlights: Array.isArray(data.highlights) && data.highlights.length > 0
                ? data.highlights
                : DEFAULT_HIGHLIGHTS,
            });
          }
          break;
        }
        case "projects": {
          const { data } = await supabase.from("projects").select("*").order("sort_order");
          if (data) setProjects(data);
          break;
        }
        case "skills": {
          const { data } = await supabase.from("skill_categories").select("*").order("sort_order");
          if (data) setSkills(data);
          break;
        }
        case "experience": {
          const { data } = await supabase.from("experiences").select("*").order("sort_order");
          if (data) setExperiences(data);
          break;
        }
        case "blog": {
          const { data } = await supabase.from("blog_posts").select("*").order("pub_date", { ascending: false });
          if (data) setBlogPosts(data);
          break;
        }
        case "testimonials": {
          const { data } = await supabase.from("testimonials").select("*").order("sort_order");
          if (data) setTestimonials(data);
          break;
        }
        case "messages": {
          const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
          if (data) setMessages(data);
          break;
        }
        case "resume": {
          const { data } = await supabase.from("resume").select("*").order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
          setResumeData(data);
          break;
        }
      }
    } catch (err) {
      notify("error", `Failed to load ${tab} data`);
    }
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    if (user) loadData(activeTab);
  }, [user, activeTab, loadData]);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    setAuthState("unauthenticated");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "personal",     label: "Profile",      icon: "user"      },
    { key: "projects",     label: "Projects",     icon: "briefcase" },
    { key: "skills",       label: "Skills",       icon: "zap"       },
    { key: "experience",   label: "Experience",   icon: "clock"     },
    { key: "blog",         label: "Blog",         icon: "file-text" },
    { key: "testimonials", label: "Testimonials", icon: "quote"     },
    { key: "messages",     label: "Messages",     icon: "inbox"     },
    { key: "resume",       label: "Resume",       icon: "download"  },
    { key: "analytics",    label: "Analytics",    icon: "bar-chart" },
  ];

  const unreadCount = messages.filter((m) => !m.read).length;  

  // ─── Loading screen ───
  if (authState === "checking" || authState === "returning") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-zinc-500">
            {/* "returning" is set synchronously so it shows immediately */}
            {authState === "returning"
              ? "Loading admin panel..."
              : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Guard: if somehow we reach here unauthenticated
  if (authState === "unauthenticated") {
    window.location.href = "/";
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── SIDEBAR ── */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`
          fixed left-0 top-0 h-full border-r border-zinc-200 bg-white
          dark:border-zinc-800 dark:bg-zinc-900
          flex flex-col overflow-hidden z-10
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? "w-60" : "w-16"}
        `}
      >
        {/* ── Logo ── */}
        <div className={`flex items-center border-b border-zinc-100 dark:border-zinc-800 h-14 px-3 shrink-0 transition-all duration-300 ${sidebarExpanded ? "gap-3" : "justify-center"}`}>
          <a
            href="/"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50"
            title="View Portfolio"
          >
            <span className="text-xs font-bold text-white dark:text-zinc-900">MZ</span>
          </a>
          {sidebarExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                M7Z6<span className="text-brand-500">.</span> Admin
              </p>
              <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                title={!sidebarExpanded ? tab.label : undefined}
                className={`
                  relative w-full flex items-center rounded-xl
                  transition-colors duration-150
                  ${sidebarExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"}
                  ${isActive
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }
                `}
              >
                {/* Icon */}
                <span className="shrink-0">
                  <ReactIcon name={tab.icon} size={18} />
                </span>

                {/* Label — only when expanded */}
                {sidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {tab.label}
                  </span>
                )}

                {/* Unread badge — messages */}
                {tab.key === "messages" && unreadCount > 0 && (
                  <span className={`
                    rounded-full bg-red-500 text-[10px] text-white font-bold leading-none
                    ${sidebarExpanded
                      ? "ml-auto px-1.5 py-0.5"
                      : "absolute top-1 right-1 flex h-4 w-4 items-center justify-center"
                    }
                  `}>
                    {unreadCount}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && !sidebarExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Sync button ── */}
        <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={async () => {
              setSyncing(true);
              setSyncResult(null);
              try {
                const response = await fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                });
                const result = await response.json();
                setSyncResult(result);
                if (result.success) {
                  notify("success", `Synced: ${result.synced.join(", ")}`);
                  await loadData(activeTab);
                } else {
                  notify("error", `Sync errors: ${result.errors.join(", ")}`);
                }
              } catch (error) {
                const msg = error instanceof Error ? error.message : "Unknown error";
                setSyncResult({ success: false, errors: [msg], synced: [] });
                notify("error", `Sync failed: ${msg}`);
              }
              setSyncing(false);
            }}
            disabled={syncing}
            title={!sidebarExpanded ? "Sync Static Data" : undefined}
            className={`
              w-full flex items-center rounded-xl transition-colors
              bg-brand-500/10 text-brand-500 hover:bg-brand-500/20
              disabled:opacity-50
              ${sidebarExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"}
            `}
          >
            <ReactIcon name={syncing ? "loader" : "arrow-up"} size={18} className={syncing ? "animate-spin" : ""} />
            {sidebarExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                {syncing ? "Syncing..." : "Sync Static Data"}
              </span>
            )}
          </button>

          {/* Sync result — only when expanded */}
          {sidebarExpanded && syncResult && (
            <div className={`mt-1.5 rounded-lg p-2 text-xs ${
              syncResult.success
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
            }`}>
              {syncResult.success ? "✅" : "❌"}{" "}
              {syncResult.synced.length > 0 && `${syncResult.synced.join(", ")}. `}
              {syncResult.errors.length > 0 && `Errors: ${syncResult.errors.join(", ")}`}
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
          <a
            href="/"
            target="_blank"
            title={!sidebarExpanded ? "View Portfolio" : undefined}
            className={`
              flex items-center rounded-xl py-2 text-sm text-zinc-500
              hover:bg-zinc-100 hover:text-zinc-900
              dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50
              transition-colors
              ${sidebarExpanded ? "gap-3 px-3" : "justify-center"}
            `}
          >
            <ReactIcon name="external-link" size={16} />
            {sidebarExpanded && <span className="whitespace-nowrap">View Portfolio</span>}
          </a>
          <button
            onClick={handleLogout}
            title={!sidebarExpanded ? "Sign Out" : undefined}
            className={`
              w-full flex items-center rounded-xl py-2 text-sm text-red-500
              hover:bg-red-50 dark:hover:bg-red-950/30
              transition-colors
              ${sidebarExpanded ? "gap-3 px-3" : "justify-center"}
            `}
          >
            <ReactIcon name="log-out" size={16} />
            {sidebarExpanded && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile warning — admin not optimized for mobile */}
      <div className="fixed inset-0 z-99999 flex items-center justify-center bg-zinc-950 p-6 lg:hidden">
        <div className="max-w-sm text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <rect width="14" height="20" x="5" y="2" rx="2"/>
              <path d="M12 18h.01"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-50">
            Desktop Required
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The admin dashboard is designed for desktop use. Please open it on a laptop or desktop browser for the best experience.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-50 hover:bg-zinc-700 transition-colors"
          >
            ← Go to Portfolio
          </a>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className={`flex-1 p-8 min-h-screen transition-all duration-300 ${sidebarExpanded ? "ml-60" : "ml-16"}`}>

        {/* Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          }`}>
            {notification.type === "success" ? "✅" : "❌"} {notification.message}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Loading...
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: PERSONAL
        ══════════════════════════════════════════════ */}
        {activeTab === "personal" && personal && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Profile</h1>

            {/* ── Basic Info ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                Basic Information
              </h2>

              {(["name", "title", "tagline", "location", "email", "availability"] as const).map((field) => (
                <Field key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
                  <input
                    type="text"
                    value={personal[field] || ""}
                    onChange={(e) => setPersonal({ ...personal, [field]: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              ))}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Bio
                  </label>
                  <button
                    type="button"
                    onClick={() => setBioModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                  >
                    <ReactIcon name="expand" size={12} />
                    Expand editor
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={personal.bio}
                  onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  className={inputCls}
                  placeholder="Write about yourself..."
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Use blank lines to separate paragraphs. They'll render as separate&nbsp;&lt;p&gt; tags.
                </p>
              </div>

              {/* ── ENHANCED: Bio fullscreen modal with formatting toolbar ── */}
              {bioModalOpen && personal && (
                <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">

                  {/* Modal header */}
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        Bio Editor
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Blank lines = new paragraph · {personal.bio.length} characters
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBioModalOpen(false)}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ReactIcon name="x-close" size={14} />
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setSavingProfile(true);
                          const { error } = await supabase
                            .from("personal")
                            .update({ bio: personal.bio })
                            .eq("id", personal.id);
                          setSavingProfile(false);
                          if (error) notify("error", error.message);
                          else { notify("success", "Bio saved! ✅"); setBioModalOpen(false); }
                        }}
                        disabled={savingProfile}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
                      >
                        <ReactIcon name="check-circle" size={14} />
                        {savingProfile ? "Saving..." : "Save Bio"}
                      </button>
                    </div>
                  </div>

                  {/* ── Formatting toolbar ── */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white px-6 py-2 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">

                    {/* Format buttons — insert markdown syntax around selection */}
                    {[
                      { label: "B",     title: "Bold",          wrap: "**",  style: "font-bold"   },
                      { label: "I",     title: "Italic",         wrap: "*",   style: "italic"      },
                      { label: "~~S~~", title: "Strikethrough",  wrap: "~~",  style: "line-through text-xs" },
                    ].map(({ label, title, wrap, style }) => (
                      <button
                        key={title}
                        type="button"
                        title={title}
                        onClick={() => {
                          const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                          if (!ta) return;
                          const start = ta.selectionStart;
                          const end   = ta.selectionEnd;
                          const sel   = ta.value.slice(start, end);
                          const newVal =
                            ta.value.slice(0, start) +
                            wrap + (sel || title) + wrap +
                            ta.value.slice(end);
                          setPersonal({ ...personal, bio: newVal });
                          // Restore cursor after wrap
                          setTimeout(() => {
                            ta.focus();
                            ta.selectionStart = start + wrap.length;
                            ta.selectionEnd   = end   + wrap.length;
                          }, 0);
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 ${style}`}
                      >
                        {label === "~~S~~" ? <span className="line-through text-xs">S</span> : label}
                      </button>
                    ))}

                    {/* Divider */}
                    <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                    {/* Paragraph / heading shortcuts */}
                    {[
                      { label: "H1",   prefix: "# "   },
                      { label: "H2",   prefix: "## "  },
                      { label: "H3",   prefix: "### " },
                    ].map(({ label, prefix }) => (
                      <button
                        key={label}
                        type="button"
                        title={`Insert ${label}`}
                        onClick={() => {
                          const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                          if (!ta) return;
                          const start   = ta.selectionStart;
                          // Find start of current line
                          const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
                          const newVal  =
                            ta.value.slice(0, lineStart) +
                            prefix +
                            ta.value.slice(lineStart);
                          setPersonal({ ...personal, bio: newVal });
                          setTimeout(() => {
                            ta.focus();
                            ta.selectionStart = ta.selectionEnd = start + prefix.length;
                          }, 0);
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                      >
                        {label}
                      </button>
                    ))}

                    {/* Divider */}
                    <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                    {/* List + quote */}
                    {[
                      { label: "• List",  title: "Bullet list",   prefix: "- "   },
                      { label: "1. List", title: "Numbered list",  prefix: "1. "  },
                      { label: "> Quote", title: "Blockquote",     prefix: "> "   },
                    ].map(({ label, title, prefix }) => (
                      <button
                        key={title}
                        type="button"
                        title={title}
                        onClick={() => {
                          const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                          if (!ta) return;
                          const start    = ta.selectionStart;
                          const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
                          const newVal   =
                            ta.value.slice(0, lineStart) +
                            prefix +
                            ta.value.slice(lineStart);
                          setPersonal({ ...personal, bio: newVal });
                          setTimeout(() => {
                            ta.focus();
                            ta.selectionStart = ta.selectionEnd = start + prefix.length;
                          }, 0);
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 font-mono"
                      >
                        {label}
                      </button>
                    ))}

                    {/* Divider */}
                    <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                    {/* Link insert */}
                    <button
                      type="button"
                      title="Insert link"
                      onClick={() => {
                        const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                        if (!ta) return;
                        const start = ta.selectionStart;
                        const end   = ta.selectionEnd;
                        const sel   = ta.value.slice(start, end) || "link text";
                        const url   = window.prompt("Enter URL:", "https://");
                        if (!url) return;
                        const insertion = `[${sel}](${url})`;
                        const newVal    =
                          ta.value.slice(0, start) +
                          insertion +
                          ta.value.slice(end);
                        setPersonal({ ...personal, bio: newVal });
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                    >
                      🔗 Link
                    </button>

                    {/* Clear all */}
                    <button
                      type="button"
                      title="Clear all formatting (keep text)"
                      onClick={() => {
                        const ta  = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                        if (!ta) return;
                        const plain = personal.bio
                          .replace(/#{1,6} /g, "")
                          .replace(/\*\*([^*]+)\*\*/g, "$1")
                          .replace(/\*([^*]+)\*/g, "$1")
                          .replace(/~~([^~]+)~~/g, "$1")
                          .replace(/^[-*] /gm, "")
                          .replace(/^\d+\. /gm, "")
                          .replace(/^> /gm, "")
                          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
                        setPersonal({ ...personal, bio: plain });
                      }}
                      className="ml-auto rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Clear formatting
                    </button>
                  </div>

                  {/* Fullscreen textarea */}
                  <div className="flex-1 p-6 overflow-hidden">
                    <textarea
                      id="bio-textarea"
                      autoFocus
                      value={personal.bio}
                      onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                      className="h-full w-full resize-none rounded-2xl border border-zinc-200 bg-white px-6 py-5 text-base leading-relaxed text-zinc-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
                      placeholder={"Write about yourself...\n\nUse blank lines to separate paragraphs.\n\n**Bold**, *italic*, # Heading\n- Bullet list"}
                      spellCheck
                    />
                  </div>

                  {/* Live preview */}
                  <div className="border-t border-zinc-200 bg-zinc-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 shrink-0 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      Live Preview
                    </p>
                    {personal.bio.split(/\n\n+/).map((para, i) => {
                      // Simple inline preview rendering
                      const rendered = para
                        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
                        .replace(/~~([^~]+)~~/g, "<s>$1</s>")
                        .replace(/^#{1,3} (.+)$/gm, "<span class='font-bold'>$1</span>")
                        .replace(/^[-*] (.+)$/gm, "• $1")
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, "<span class='text-brand-500 underline'>$1</span>");
                      return (
                        <p
                          key={i}
                          className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2 last:mb-0"
                          dangerouslySetInnerHTML={{ __html: rendered }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <Field label="Profile Photo">
                <ImageCropUpload
                  folder="portfolio/profile"
                  label="Profile Photo"
                  hint="Square recommended (min 600×600px) — use the 1:1 crop preset"
                  currentUrl={personal.profile_photo_url || null}
                  defaultAspect="square"
                  onUpload={(result) => {
                    setPersonal({ ...personal, profile_photo_url: result.url });
                    notify("success", "Photo uploaded! Click Save Profile to apply.");
                  }}
                  onRemove={() => {
                    // Clear profile photo URL in state — Save Profile will persist null
                    setPersonal({ ...personal, profile_photo_url: null });
                    notify("success", "Photo removed. Click Save Profile to apply.");
                  }}
                />
              </Field>

              {(["github_url", "linkedin_url", "twitter_url"] as const).map((field) => (
                <Field key={field} label={field.replace("_url", "").replace("_", " ").toUpperCase() + " URL"}>
                  <input
                    type="url"
                    value={personal[field] || ""}
                    onChange={(e) => setPersonal({ ...personal, [field]: e.target.value || null })}
                    className={inputCls}
                    placeholder="https://"
                  />
                </Field>
              ))}

              {/* Save Profile button */}
              <button
                type="button"
                onClick={async () => {
                  setSavingProfile(true);
                  const { error } = await supabase.from("personal").update({
                    name: personal.name,
                    title: personal.title,
                    tagline: personal.tagline,
                    bio: personal.bio,
                    location: personal.location,
                    email: personal.email,
                    availability: personal.availability,
                    github_url: personal.github_url,
                    linkedin_url: personal.linkedin_url,
                    twitter_url: personal.twitter_url,
                    profile_photo_url: personal.profile_photo_url ?? null,
                  }).eq("id", personal.id);
                  setSavingProfile(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Profile saved!");
                }}
                disabled={savingProfile}
                className={btnPrimary + " px-6 py-3 text-sm"}
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>

            {/* ── Top Skills ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Top Skills
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Shown as progress bars on the About section</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPersonal({
                      ...personal,
                      top_skills: [...personal.top_skills, { name: "", level: 80 }],
                    })
                  }
                  className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-500/20 transition-colors"
                >
                  + Add Skill
                </button>
              </div>

              {/* ── Column headers ── */}
              <div className="grid grid-cols-[1fr_100px_40px] gap-3 px-1">
                <span className="text-xs font-medium text-zinc-400">Skill Name</span>
                <span className="text-xs font-medium text-zinc-400 text-center">Level (0–100)</span>
                <span />
              </div>

              <div className="space-y-3">
                {personal.top_skills.map((skill, idx) => (
                  <div key={idx} className="space-y-1.5">
                    {/* ── Row: name input + level input + delete ── */}
                    <div className="grid grid-cols-[1fr_100px_40px] gap-3 items-center">
                      {/* Skill Name — full width, clearly labelled */}
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => {
                          const updated = personal.top_skills.map((s, i) =>
                            i === idx ? { ...s, name: e.target.value } : s
                          );
                          setPersonal({ ...personal, top_skills: updated });
                        }}
                        placeholder="e.g. React / Next.js"
                        className={inputCls}
                      />

                      {/* Level — number only, constrained width */}
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={skill.level}
                          onChange={(e) => {
                            const updated = personal.top_skills.map((s, i) =>
                              i === idx
                                ? { ...s, level: Math.min(100, Math.max(0, Number(e.target.value))) }
                                : s
                            );
                            setPersonal({ ...personal, top_skills: updated });
                          }}
                          className={inputCls + " pr-7 text-center"}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">
                          %
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          setPersonal({
                            ...personal,
                            top_skills: personal.top_skills.filter((_, i) => i !== idx),
                          })
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 transition-colors"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                      </button>
                    </div>

                    {/* ── Live preview bar (full width, below the row) ── */}
                    <div className="flex items-center gap-2 pl-1">
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-8 text-right">{skill.level}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {personal.top_skills.length === 0 && (
                <p className="text-sm text-center text-zinc-400 py-4">
                  No skills yet. Click "+ Add Skill" above.
                </p>
              )}

              {/* Save Top Skills button */}
              <button
                type="button"
                onClick={async () => {
                  setSavingSkills(true);
                  const { error } = await supabase
                    .from("personal")
                    .update({ top_skills: personal.top_skills })
                    .eq("id", personal.id);
                    setSavingSkills(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Top skills saved! ✅");
                }}
                disabled={savingSkills}
                className={btnPrimary}
              >
                {savingSkills ? "Saving..." : "Save Top Skills"}
              </button>
            </div>

            {/* ── Highlights ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Highlights
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Stat cards shown below your bio</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPersonal({
                      ...personal,
                      highlights: [...personal.highlights, { icon: "star", label: "New Stat", value: "0+" }],
                    })
                  }
                  className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-500/20 transition-colors"
                >
                  + Add Highlight
                </button>
              </div>

              {/* ── Column headers ── */}
              <div className="grid grid-cols-[90px_1fr_90px_40px] gap-3 px-1">
                <span className="text-xs font-medium text-zinc-400">Icon Name</span>
                <span className="text-xs font-medium text-zinc-400">Label</span>
                <span className="text-xs font-medium text-zinc-400">Value</span>
                <span />
              </div>

              {/* ── Available icons hint ── */}
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p className="font-medium">Available icon names:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["briefcase", "calendar", "coffee", "heart", "star", "user", "mail", "github", "linkedin"].map(
                    (name) => (
                      <code key={name} className="rounded bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[11px]">
                        {name}
                      </code>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {personal.highlights.map((h, idx) => (
                  <div key={idx} className="grid grid-cols-[90px_1fr_90px_40px] gap-3 items-center">
                    {/* Icon */}
                    <input
                      type="text"
                      value={h.icon}
                      onChange={(e) => {
                        const updated = personal.highlights.map((x, i) =>
                          i === idx ? { ...x, icon: e.target.value } : x
                        );
                        setPersonal({ ...personal, highlights: updated });
                      }}
                      className={inputCls + " text-xs font-mono"}
                      placeholder="briefcase"
                    />
                    {/* Label */}
                    <input
                      type="text"
                      value={h.label}
                      onChange={(e) => {
                        const updated = personal.highlights.map((x, i) =>
                          i === idx ? { ...x, label: e.target.value } : x
                        );
                        setPersonal({ ...personal, highlights: updated });
                      }}
                      className={inputCls}
                      placeholder="Years Experience"
                    />
                    {/* Value */}
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => {
                        const updated = personal.highlights.map((x, i) =>
                          i === idx ? { ...x, value: e.target.value } : x
                        );
                        setPersonal({ ...personal, highlights: updated });
                      }}
                      className={inputCls + " text-center"}
                      placeholder="5+"
                    />
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        setPersonal({
                          ...personal,
                          highlights: personal.highlights.filter((_, i) => i !== idx),
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 transition-colors"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {personal.highlights.length === 0 && (
                <p className="text-sm text-center text-zinc-400 py-4">
                  No highlights yet. Click "+ Add Highlight" above.
                </p>
              )}

              {/* Save Highlights button */}
              <button
                type="button"
                onClick={async () => {
                  setSavingHighlights(true);
                  const { error } = await supabase
                    .from("personal")
                    .update({ highlights: personal.highlights })
                    .eq("id", personal.id);
                    setSavingHighlights(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Highlights saved! ✅");
                }}
                disabled={savingHighlights}
                className={btnPrimary}
              >
                {savingHighlights ? "Saving..." : "Save Highlights"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: PROJECTS (Edit + Add + Delete)
        ══════════════════════════════════════════════ */}
        {activeTab === "projects" && (
          <div className="flex gap-6">

            {/* ── Project preview modal ── */}
            {previewProject && (
              <ProjectPreviewModal
                project={previewProject}
                onClose={() => setPreviewProject(null)}
              />
            )}

            {/* Project description modal */}
            {projectModalOpen && editingProject && (
              <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">

                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      Edit Description — {editingProject.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectModalOpen(false);
                      setEditingProject(null);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ReactIcon name="x-close" size={14} />
                    Close
                  </button>
                </div>

                {/* Modal content */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full flex flex-col">
                    {/* Editor */}
                    <div className="flex-1 p-6">
                      <MarkdownEditor
                        value={editingProject.description}
                        onChange={(val) => setEditingProject({ ...editingProject, description: val })}
                        height={400}
                        placeholder="Project description..."
                      />
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setProjectModalOpen(false);
                          setEditingProject(null);
                        }}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setSavingProject(true);
                          const { error } = await supabase
                            .from("projects")
                            .update({ description: editingProject.description })
                            .eq("id", editingProject.id);
                          setSavingProject(false);
                          if (error) notify("error", error.message);
                          else {
                            notify("success", "Description saved! ✅");
                            setProjectModalOpen(false);
                            setEditingProject(null);
                            // Update the list
                            setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
                          }
                        }}
                        disabled={savingProject}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
                      >
                        <ReactIcon name="check-circle" size={14} />
                        {savingProject ? "Saving..." : "Save Description"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Main content column ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Projects ({projects.length})</h1>
                <button
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from("projects")
                      .insert({ title: "New Project", description: "Description", tags: [], featured: false, sort_order: projects.length + 1 })
                      .select().single();
                    if (error) notify("error", error.message);
                    else { setProjects((p) => [...p, data]); notify("success", "Project added! Edit below."); }
                  }}
                  className={btnAdd}
                >
                  + Add Project
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} id={`project-${project.id}`} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl scroll-mt-8 p-6 gap-0">
                    <div className="grid gap-3 md:grid-cols-2 mb-3">
                      <Field label="Title">
                        <input type="text" value={project.title} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, title: e.target.value } : p))} className={inputCls} />
                      </Field>
                      <Field label="Year">
                        <input type="text" value={project.year || ""} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, year: e.target.value } : p))} className={inputCls} placeholder="2025" />
                      </Field>
                    </div>
                    <div className="mb-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Description
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(project);
                              setProjectModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                          >
                            <ReactIcon name="expand" size={12} />
                            Expand editor
                          </button>
                        </div>
                        <textarea rows={2} value={project.description} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, description: e.target.value } : p))} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3 mb-3">
                      <Field label="Tags (comma-separated)">
                        <TagInput
                          value={project.tags}
                          onChange={(newTags) => setProjects(projects.map((p) => p.id === project.id ? { ...p, tags: newTags } : p))}
                          placeholder="e.g. React, TypeScript, Node.js"
                        />
                      </Field>
                      <Field label="Live URL">
                        <input type="url" value={project.live_url || ""} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, live_url: e.target.value || null } : p))} className={inputCls} placeholder="https://" />
                      </Field>
                      <Field label="GitHub URL">
                        <input type="url" value={project.github_url || ""} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, github_url: e.target.value || null } : p))} className={inputCls} placeholder="https://github.com/..." />
                      </Field>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 mb-4">
                      <Field label="Outcome (e.g. Increased X by 30%)">
                        <input type="text" value={project.outcome || ""} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, outcome: e.target.value || null } : p))} className={inputCls} />
                      </Field>
                      <Field label="Sort Order (lower = first)">
                        <input type="number" value={project.sort_order} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, sort_order: Number(e.target.value) } : p))} className={inputCls} />
                      </Field>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={project.featured} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, featured: e.target.checked } : p))} className="rounded" />
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Featured on homepage</span>
                      </label>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <ImageCropUpload
                        folder="portfolio/projects"
                        label="Project Image — adjust crop/framing before upload"
                        hint="Recommended: 1280×720px (16:9) — use the 16:9 crop preset"
                        currentUrl={project.image_url}
                        defaultAspect="video"
                        onUpload={(result) => {
                          setProjects(projects.map((p) =>
                            p.id === project.id ? { ...p, image_url: result.url } : p
                          ));
                          notify("success", "Image uploaded! Click Save to apply.");
                        }}
                        onRemove={() => {
                          setProjects(projects.map((p) =>
                            p.id === project.id ? { ...p, image_url: null } : p
                          ));
                        }}
                      />
                    </div>

                    {/* ── P6: Image Gallery ── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Image Gallery
                          <span className="ml-1 text-zinc-400">(additional screenshots)</span>
                        </label>
                        <span className="text-xs text-zinc-400">
                          {(project.gallery_images ?? []).length} images
                        </span>
                      </div>

                      {/* Existing gallery images */}
                      {(project.gallery_images ?? []).length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {(project.gallery_images ?? []).map((url: string, imgIdx: number) => (
                            <div key={imgIdx} className="relative group aspect-video overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                              <img
                                src={url}
                                alt={`Gallery ${imgIdx + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setProjects(projects.map((p) =>
                                    p.id === project.id
                                      ? {
                                          ...p,
                                          gallery_images: (p.gallery_images ?? []).filter(
                                            (_: string, i: number) => i !== imgIdx
                                          ),
                                        }
                                      : p
                                  ))
                                }
                                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                title="Remove image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add to gallery */}
                      <CloudinaryMultiUpload
                        folder="portfolio/projects/gallery"
                        onUploadMany={(urls) => {
                          setProjects(projects.map((p) =>
                            p.id === project.id
                              ? { ...p, gallery_images: [...(p.gallery_images ?? []), ...urls] }
                              : p
                          ));
                          notify("success", `Added ${urls.length} screenshots. Click Save.`);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">

                      {/* Status badges */}
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-500">
                            ★ Featured
                          </span>
                        )}
                        {project.live_url && (
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                            ● Live
                          </span>
                        )}
                        {!project.live_url && !project.github_url && (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                            ○ No links
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewProject(project)}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ReactIcon name="eye" size={12} />
                          Preview
                        </button>
                        <button
                          onClick={async () => {
                            setSaving(true);
                            const { error } = await supabase
                              .from("projects")
                              .update({
                                ...project,
                                gallery_images: project.gallery_images ?? [],
                              })
                              .eq("id", project.id);
                            setSaving(false);
                            if (error) notify("error", error.message);
                            else notify("success", `"${project.title}" saved!`);
                          }}
                          className={btnPrimary}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete "${project.title}"?`)) return;
                            const { error } = await supabase
                              .from("projects")
                              .delete()
                              .eq("id", project.id);
                            if (error) notify("error", error.message);
                            else {
                              setProjects(projects.filter((p) => p.id !== project.id));
                              notify("success", "Project deleted");
                            }
                          }}
                          className={btnDanger}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}

                {projects.length === 0 && !loading && (
                  <EmptyState title="No content yet" description="Add your first item using the form above." />
                )}
              </div>
              {/* end of projects list */}
              {projects.length === 0 && !loading && (
                <EmptyState title="No content yet" description="Add your first item using the form above." />
              )}
            </div>{/* end flex-1 */}

            {/* ── F2: Jump list sidebar ── */}
            {projects.length > 0 && (
              <aside className="hidden xl:block w-52 shrink-0">
                <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Projects
                    </p>
                    <span className="text-xs text-zinc-400">{projects.length}</span>
                  </div>
                  <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto py-1">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`project-${project.id}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                      >
                        <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500/40 group-hover:bg-brand-500 transition-colors" />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                          {project.title}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: SKILLS — Full CRUD
        ══════════════════════════════════════════════ */}
        {activeTab === "skills" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Skills ({skills.length} categories)</h1>
              <button
                onClick={async () => {
                  const { data, error } = await supabase
                    .from("skill_categories")
                    .insert({ title: "New Category", skills: [], sort_order: skills.length + 1 })
                    .select().single();
                  if (error) notify("error", error.message);
                  else { setSkills((s) => [...s, data]); notify("success", "Category added!"); }
                }}
                className={btnAdd}
              >
                + Add Category
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((cat) => (
                <Card key={cat.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
                  <div className="grid gap-3 md:grid-cols-3 mb-4">
                    <Field label="Category Name">
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => setSkills(skills.map((s) => s.id === cat.id ? { ...s, title: e.target.value } : s))}
                        className={inputCls}
                        placeholder="e.g. Frontend"
                      />
                    </Field>
                    <Field label="Sort Order">
                      <input
                        type="number"
                        value={cat.sort_order}
                        onChange={(e) => setSkills(skills.map((s) => s.id === cat.id ? { ...s, sort_order: Number(e.target.value) } : s))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Skills (comma-separated — e.g. React, TypeScript, Node.js)">
                  <TagInput
                    value={cat.skills}
                    onChange={(newSkills) => setSkills(skills.map((s) => s.id === cat.id ? { ...s, skills: newSkills } : s))}
                    placeholder="Type a skill and press Enter or comma..."
                  />
                  </Field>

                  {/* Preview chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from("skill_categories").update(cat).eq("id", cat.id);
                        if (error) notify("error", error.message);
                        else notify("success", `"${cat.title}" saved!`);
                      }}
                      className={btnPrimary}
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${cat.title}" category?`)) return;
                        const { error } = await supabase.from("skill_categories").delete().eq("id", cat.id);
                        if (error) notify("error", error.message);
                        else { setSkills(skills.filter((s) => s.id !== cat.id)); notify("success", "Category deleted"); }
                      }}
                      className={btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}

              {skills.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No skill categories. Click "+ Add Category" above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: EXPERIENCE — Full CRUD
        ══════════════════════════════════════════════ */}
        {activeTab === "experience" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Experience ({experiences.length})</h1>
              <button
                onClick={async () => {
                  const { data, error } = await supabase
                    .from("experiences")
                    .insert({ company: "Company Name", role: "Job Title", period: "2024 — Present", description: "Description here.", achievements: [], sort_order: experiences.length + 1 })
                    .select().single();
                  if (error) notify("error", error.message);
                  else { setExperiences((e) => [...e, data]); notify("success", "Experience added!"); }
                }}
                className={btnAdd}
              >
                + Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
                  <div className="grid gap-3 md:grid-cols-3 mb-3">
                    <Field label="Role / Job Title">
                      <input type="text" value={exp.role} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, role: e.target.value } : x))} className={inputCls} />
                    </Field>
                    <Field label="Company">
                      <input type="text" value={exp.company} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} className={inputCls} />
                    </Field>
                    <Field label="Period (e.g. 2023 — Present)">
                      <input type="text" value={exp.period} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, period: e.target.value } : x))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="mb-3">
                    <Field label="Description">
                      <textarea rows={2} value={exp.description} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="mb-4">
                    {/* Experience tab — achievements textarea */}
                    <Field label="Achievements (one per line — will display as bullet points)">
                      <textarea
                        rows={5}
                        // ✅ Display as newline-joined string — preserves spaces and empty lines
                        value={achievementsToText(exp.achievements)}
                        onChange={(e) => {
                          // ✅ Store RAW lines during editing — no trim(), no filter()
                          // This preserves spaces mid-word and empty lines between entries
                          const rawLines = e.target.value.split("\n");
                          setExperiences(
                            experiences.map((x) =>
                              x.id === exp.id
                                ? { ...x, achievements: rawLines }
                                : x
                            )
                          );
                        }}
                        className={inputCls}
                        placeholder={`Reduced page load time by 45%\nLed migration from CRA to Next.js\nMentored 4 junior developers`}
                      />
                    </Field>
                    {/* Live preview — filter here for display only */}
                    <ul className="mt-2 space-y-1">
                      {exp.achievements
                        .map((a) => a.trim())
                        .filter(Boolean)
                        .map((a, i) => (
                          <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400">
                            • {a}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <Field label="Sort Order">
                    <input type="number" value={exp.sort_order} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, sort_order: Number(e.target.value) } : x))} className={inputCls + " w-24"} />
                  </Field>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={async () => {
                        // ✅ Clean achievements on save, not during editing
                        const cleanedExp = {
                          ...exp,
                          achievements: exp.achievements
                            .map((a) => a.trim())
                            .filter(Boolean),
                        };
                        const { error } = await supabase
                          .from("experiences")
                          .update(cleanedExp)
                          .eq("id", exp.id);

                        // Also update local state with cleaned version
                        if (!error) {
                          setExperiences(
                            experiences.map((x) => (x.id === exp.id ? cleanedExp : x))
                          );
                          notify("success", `"${exp.role}" at ${exp.company} saved!`);
                        } else {
                          notify("error", error.message);
                        }
                      }}
                      className={btnPrimary}
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${exp.role}" at ${exp.company}?`)) return;
                        const { error } = await supabase.from("experiences").delete().eq("id", exp.id);
                        if (error) notify("error", error.message);
                        else { setExperiences(experiences.filter((x) => x.id !== exp.id)); notify("success", "Experience deleted"); }
                      }}
                      className={btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}

              {experiences.length === 0 && !loading && (
                <EmptyState title="No experiences yet" description="Add your first experience using the form above." />
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: TESTIMONIALS — Full CRUD
        ══════════════════════════════════════════════ */}
        {activeTab === "testimonials" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Testimonials ({testimonials.length})</h1>
              <button
                onClick={async () => {
                  const { data, error } = await supabase
                    .from("testimonials")
                    .insert({ name: "Name", role: "Role", company: "Company", content: "Testimonial content here.", sort_order: testimonials.length + 1 })
                    .select().single();
                  if (error) notify("error", error.message);
                  else { setTestimonials((t) => [...t, data]); notify("success", "Testimonial added!"); }
                }}
                className={btnAdd}
              >
                + Add Testimonial
              </button>
            </div>

            <div className="space-y-4">
              {testimonials.map((t) => (
                <Card key={t.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-8 gap-0">
                  <div className="grid gap-3 md:grid-cols-3 mb-3">
                    <Field label="Name">
                      <input type="text" value={t.name} onChange={(e) => setTestimonials(testimonials.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} className={inputCls} />
                    </Field>
                    <Field label="Role">
                      <input type="text" value={t.role} onChange={(e) => setTestimonials(testimonials.map((x) => x.id === t.id ? { ...x, role: e.target.value } : x))} className={inputCls} />
                    </Field>
                    <Field label="Company">
                      <input type="text" value={t.company} onChange={(e) => setTestimonials(testimonials.map((x) => x.id === t.id ? { ...x, company: e.target.value } : x))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="mb-3">
                    <Field label="Testimonial Content">
                      <textarea rows={3} value={t.content} onChange={(e) => setTestimonials(testimonials.map((x) => x.id === t.id ? { ...x, content: e.target.value } : x))} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Sort Order">
                    <input type="number" value={t.sort_order} onChange={(e) => setTestimonials(testimonials.map((x) => x.id === t.id ? { ...x, sort_order: Number(e.target.value) } : x))} className={inputCls + " w-24"} />
                  </Field>

                  {/* Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 italic">"{t.content}"</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">— {t.name}, {t.role} at {t.company}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from("testimonials").update(t).eq("id", t.id);
                        if (error) notify("error", error.message);
                        else notify("success", `"${t.name}" saved!`);
                      }}
                      className={btnPrimary}
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
                        const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
                        if (error) notify("error", error.message);
                        else { setTestimonials(testimonials.filter((x) => x.id !== t.id)); notify("success", "Testimonial deleted"); }
                      }}
                      className={btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}

              {testimonials.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No testimonials yet. Click "+ Add Testimonial" above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: BLOG — Full CRUD + Phase 3 upgraded
            P1: Markdown editor
            P2: Preview before publish
            P3: SEO metadata
            P4: Scheduling
        ══════════════════════════════════════════════ */}
        {activeTab === "blog" && (
          <div className="flex gap-6">
            {/* ── Main content column ── */}
            <div className="flex-1 min-w-0">
              {/* Preview modal — rendered outside tab content */}
              {previewPost && (
                <BlogPreviewModal
                  post={previewPost}
                  onClose={() => setPreviewPost(null)}
                />
              )}

              {/* Blog description modal — rendered outside tab content */}
              {blogModalOpen && editingBlogPost && (
                <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">

                  {/* Modal header */}
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        Edit Description — {editingBlogPost.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBlogModalOpen(false);
                        setEditingBlogPost(null);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ReactIcon name="x-close" size={14} />
                      Close
                    </button>
                  </div>

                  {/* Modal content */}
                  <div className="flex-1 overflow-hidden">
                    <div className="h-full flex flex-col">
                      {/* Editor */}
                      <div className="flex-1 p-6">
                        <MarkdownEditor
                          value={editingBlogPost.description}
                          onChange={(val) => setEditingBlogPost({ ...editingBlogPost, description: val })}
                          height={400}
                          placeholder="Post description shown in previews and SEO..."
                        />
                      </div>

                      {/* Save button */}
                      <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setBlogModalOpen(false);
                            setEditingBlogPost(null);
                          }}
                          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setSavingBlog(true);
                            const { error } = await supabase
                              .from("blog_posts")
                              .update({ description: editingBlogPost.description })
                              .eq("id", editingBlogPost.id);
                            setSavingBlog(false);
                            if (error) notify("error", error.message);
                            else {
                              notify("success", "Description saved! ✅");
                              setBlogModalOpen(false);
                              setEditingBlogPost(null);
                              // Update the list
                              setBlogPosts(blogPosts.map(p => p.id === editingBlogPost.id ? editingBlogPost : p));
                            }
                          }}
                          disabled={savingBlog}
                          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
                        >
                          <ReactIcon name="check-circle" size={14} />
                          {savingBlog ? "Saving..." : "Save Description"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Blog Posts ({blogPosts.length})
                </h1>
                <button
                  type="button"
                  onClick={async () => {
                    const slug = `post-${Date.now()}`;
                    const { data, error } = await supabase
                      .from("blog_posts")
                      .insert({
                        title: "New Post",
                        slug,
                        description: "Post description",
                        content: "# New Post\n\nWrite your content here.",
                        published: false,
                        tags: [],
                        meta_title: null,
                        meta_description: null,
                        og_image: null,
                        scheduled_for: null,
                      })
                      .select()
                      .single();
                    if (error) notify("error", error.message);
                    else {
                      setBlogPosts((p) => [data, ...p]);
                      notify("success", "Post created! Edit below.");
                    }
                  }}
                  className={btnAdd}
                >
                  + New Post
                </button>
              </div>

              <div className="space-y-6">
                {blogPosts.map((post) => (
                  <div key={post.id} id={`post-${post.id}`} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden scroll-mt-8">
                    {/* ── Post Header Bar ── */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.published
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : post.scheduled_for
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {post.published
                            ? "● Published"
                            : post.scheduled_for
                            ? "🕐 Scheduled"
                            : "○ Draft"}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">/{post.slug}</span>
                        {post.pub_date && (
                          <span className="text-xs text-zinc-400">
                            {new Date(post.pub_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        )}
                      </div>

                      {/* ── Preview Button ── */}
                      <button
                        type="button"
                        onClick={() => setPreviewPost(post)}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Preview
                      </button>
                    </div>

                    <div className="p-6 space-y-5">

                      {/* ── Basic Fields ── */}
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Title">
                          <input
                            type="text"
                            value={post.title}
                            onChange={(e) =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, title: e.target.value } : p
                              ))
                            }
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Slug (URL path — no spaces)">
                          <input
                            type="text"
                            value={post.slug}
                            onChange={(e) =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      slug: e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                        .replace(/[^a-z0-9-]/g, ""),
                                    }
                                  : p
                              ))
                            }
                            className={inputCls + " font-mono text-sm"}
                          />
                        </Field>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Description (shown in previews and SEO)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBlogPost(post);
                              setBlogModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                          >
                            <ReactIcon name="expand" size={12} />
                            Expand editor
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={post.description}
                          onChange={(e) =>
                            setBlogPosts(blogPosts.map((p) =>
                              p.id === post.id ? { ...p, description: e.target.value } : p
                            ))
                          }
                          className={inputCls}
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Tags">
                          <TagInput
                            value={post.tags}
                            onChange={(newTags) =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, tags: newTags } : p
                              ))
                            }
                            placeholder="e.g. Web Dev, TypeScript"
                          />
                        </Field>
                        <Field label="Hero Image">
                          <CloudinaryUpload
                            folder="portfolio/blog"
                            currentUrl={post.hero_image}
                            aspectRatio="video"
                            hint="Recommended: 1200×630px"
                            onUpload={(result) =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, hero_image: result.url } : p
                              ))
                            }
                            onRemove={() =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, hero_image: null } : p
                              ))
                            }
                          />
                        </Field>
                      </div>

                      {/* ── P1: Markdown Editor ── */}
                      <Field label="Content (Markdown)">
                        <MarkdownEditor
                          value={post.content}
                          onChange={(val) =>
                            setBlogPosts(blogPosts.map((p) =>
                              p.id === post.id ? { ...p, content: val } : p
                            ))
                          }
                          height={450}
                          placeholder="# Post Title&#10;&#10;Write your content in Markdown..."
                        />
                      </Field>

                      {/* ── P3: SEO Metadata ── */}
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-2 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                          </svg>
                          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            SEO Metadata
                          </h3>
                          <span className="text-xs text-zinc-400">
                            (overrides title/description for search engines)
                          </span>
                        </div>

                        <Field label="Meta Title (60 chars recommended)">
                          <div className="relative">
                            <input
                              type="text"
                              value={post.meta_title || ""}
                              onChange={(e) =>
                                setBlogPosts(blogPosts.map((p) =>
                                  p.id === post.id
                                    ? { ...p, meta_title: e.target.value || null }
                                    : p
                                ))
                              }
                              placeholder={`${post.title} | Your Name`}
                              maxLength={70}
                              className={inputCls + " pr-12"}
                            />
                            <span
                              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                                (post.meta_title?.length ?? 0) > 60
                                  ? "text-red-500"
                                  : "text-zinc-400"
                              }`}
                            >
                              {post.meta_title?.length ?? 0}/60
                            </span>
                          </div>
                        </Field>

                        <Field label="Meta Description (155 chars recommended)">
                          <div className="relative">
                            <textarea
                              rows={2}
                              value={post.meta_description || ""}
                              onChange={(e) =>
                                setBlogPosts(blogPosts.map((p) =>
                                  p.id === post.id
                                    ? { ...p, meta_description: e.target.value || null }
                                    : p
                                ))
                              }
                              placeholder={post.description}
                              maxLength={170}
                              className={inputCls + " pr-16 resize-none"}
                            />
                            <span
                              className={`absolute right-3 top-3 text-xs ${
                                (post.meta_description?.length ?? 0) > 155
                                  ? "text-red-500"
                                  : "text-zinc-400"
                              }`}
                            >
                              {post.meta_description?.length ?? 0}/155
                            </span>
                          </div>
                        </Field>

                        <Field label="OG Image URL (1200×630px — for social sharing)">
                          <CloudinaryUpload
                            folder="portfolio/blog/og"
                            currentUrl={post.og_image}
                            aspectRatio="wide"
                            hint="1200×630px — shown when shared on Twitter, LinkedIn, WhatsApp"
                            onUpload={(result) =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, og_image: result.url } : p
                              ))
                            }
                            onRemove={() =>
                              setBlogPosts(blogPosts.map((p) =>
                                p.id === post.id ? { ...p, og_image: null } : p
                              ))
                            }
                          />
                        </Field>

                        {/* ── Live SEO Preview ── */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                          <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                            Google Preview
                          </p>
                          <p className="text-base font-medium text-blue-600 dark:text-blue-400 truncate">
                            {post.meta_title || post.title || "Post Title"}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
                            {`${typeof window !== "undefined" ? window.location.origin : "https://yoursite.com"}/blog/${post.slug}`}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {post.meta_description || post.description || "Post description will appear here..."}
                          </p>
                        </div>
                      </div>

                      {/* ── P4: Scheduling + Publish Controls ── */}
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">

                        {/* ── B2 + B3: Published toggle with confirmation + pub_date fix ── */}
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={post.published}
                            onChange={async (e) => {
                              const publishing = e.target.checked;

                              // ── B2: Confirmation before publishing ──
                              if (publishing) {
                                const confirmed = window.confirm(
                                  `Publish "${post.title}"?\n\nThis will make it live on your portfolio immediately.`
                                );
                                if (!confirmed) return; // user cancelled — do nothing
                              }

                              // ── B3: Set pub_date to NOW when publishing if not already set ──
                              // Without a pub_date, Supabase ORDER BY pub_date DESC won't surface it
                              const pubDateToSet =
                                publishing && !post.pub_date
                                  ? new Date().toISOString()
                                  : post.pub_date;

                              // ── Optimistic UI update ──
                              setBlogPosts((prev) =>
                                prev.map((p) =>
                                  p.id === post.id
                                    ? {
                                        ...p,
                                        published: publishing,
                                        pub_date: pubDateToSet,
                                        // Clear schedule when manually publishing
                                        scheduled_for: publishing ? null : p.scheduled_for,
                                      }
                                    : p
                                )
                              );

                              const { error } = await supabase
                                .from("blog_posts")
                                .update({
                                  published:     publishing,
                                  pub_date:      pubDateToSet,          // ✅ B3: persist pub_date
                                  scheduled_for: publishing ? null : post.scheduled_for,
                                })
                                .eq("id", post.id);

                              if (error) {
                                // ── Revert optimistic update on failure ──
                                setBlogPosts((prev) =>
                                  prev.map((p) =>
                                    p.id === post.id
                                      ? {
                                          ...p,
                                          published:    !publishing,
                                          pub_date:     post.pub_date,
                                          scheduled_for: post.scheduled_for,
                                        }
                                      : p
                                  )
                                );
                                notify("error", `Failed to ${publishing ? "publish" : "unpublish"}: ${error.message}`);
                              } else {
                                notify(
                                  "success",
                                  publishing
                                    ? `"${post.title}" is now live! ✅`
                                    : `"${post.title}" unpublished — saved as draft.`
                                );
                              }
                            }}
                            className="rounded accent-brand-500 cursor-pointer"
                          />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            Published
                          </span>
                        </label>

                        {/* ── B4: Schedule picker — shows user's local timezone label ── */}
                        {!post.published && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                Schedule for:
                              </label>
                              <input
                                type="datetime-local"
                                value={isoToDatetimeLocal(post.scheduled_for)}
                                onChange={(e) =>
                                  setBlogPosts((prev) =>
                                    prev.map((p) =>
                                      p.id === post.id
                                        ? { ...p, scheduled_for: datetimeLocalToIso(e.target.value) }
                                        : p
                                    )
                                  )
                                }
                                className={inputCls + " text-xs w-auto"}
                              />
                              {post.scheduled_for && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setBlogPosts((prev) =>
                                      prev.map((p) =>
                                        p.id === post.id ? { ...p, scheduled_for: null } : p
                                      )
                                    )
                                  }
                                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            {/* ── B4: Timezone label so user knows exactly what time they're setting ── */}
                            <div className="flex items-center gap-2 pl-1">
                              <span className="text-[11px] text-zinc-400">
                                ⏰ Times are in your local timezone:{" "}
                                <span className="font-medium text-zinc-500">
                                  {getUserTimezoneLabel()}
                                </span>
                              </span>
                              {/* Show human-readable scheduled date */}
                              {post.scheduled_for && (
                                <span className="text-[11px] text-amber-500 font-medium">
                                  → Will publish: {formatScheduledDate(post.scheduled_for)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ── Action buttons (unchanged) ── */}
                        <div className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPost(post)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const { error } = await supabase
                                .from("blog_posts")
                                .update({
                                  title:            post.title,
                                  slug:             post.slug,
                                  description:      post.description,
                                  content:          post.content,
                                  tags:             post.tags,
                                  hero_image:       post.hero_image,
                                  published:        post.published,
                                  pub_date:         post.pub_date,       // ✅ Always persist pub_date on save
                                  meta_title:       post.meta_title,
                                  meta_description: post.meta_description,
                                  og_image:         post.og_image,
                                  scheduled_for:    post.scheduled_for,
                                })
                                .eq("id", post.id);
                              if (error) notify("error", error.message);
                              else notify("success", `"${post.title}" saved!`);
                            }}
                            className={btnPrimary}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
                              const { error } = await supabase
                                .from("blog_posts")
                                .delete()
                                .eq("id", post.id);
                              if (error) notify("error", error.message);
                              else {
                                setBlogPosts((prev) => prev.filter((p) => p.id !== post.id));
                                notify("success", "Post deleted");
                              }
                            }}
                            className={btnDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {blogPosts.length === 0 && !loading && (
                  <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                    <p className="text-zinc-500 mb-3">No blog posts yet.</p>
                    <p className="text-xs text-zinc-400">
                      Click <strong>⬆ Sync Static Data</strong> in the sidebar to import
                      your MDX blog posts, or click <strong>+ New Post</strong> above.
                    </p>
                  </div>
                )}
              </div>
              {blogPosts.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500 mb-3">No blog posts yet.</p>
                  <p className="text-xs text-zinc-400">
                    Click <strong>⬆ Sync Static Data</strong> in the sidebar to import
                    your MDX blog posts, or click <strong>+ New Post</strong> above.
                  </p>
                </div>
              )}
            </div>{/* end flex-1 */}

            {/* ── F2: Blog jump list ── */}
            {blogPosts.length > 0 && (
              <aside className="hidden xl:block w-52 shrink-0">
                <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Posts
                    </p>
                    <span className="text-xs text-zinc-400">{blogPosts.length}</span>
                  </div>
                  <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto py-1">
                    {blogPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`post-${post.id}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="w-full flex items-start gap-2 px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                      >
                        {/* Status dot */}
                        <span className={`mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full ${
                          post.published
                            ? "bg-green-500"
                            : post.scheduled_for
                            ? "bg-amber-400"
                            : "bg-zinc-300 dark:bg-zinc-600"
                        }`} />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                          {post.title}
                        </span>
                      </button>
                    ))}
                  </nav>
                  {/* Legend */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 flex flex-col gap-1">
                    {[
                      { color: "bg-green-500",              label: "Published"  },
                      { color: "bg-amber-400",              label: "Scheduled"  },
                      { color: "bg-zinc-300 dark:bg-zinc-600", label: "Draft"   },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                        <span className="text-[10px] text-zinc-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: MESSAGES
        ══════════════════════════════════════════════ */}
        {activeTab === "messages" && (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
              Messages <span className="text-zinc-400 font-normal text-xl">({messages.length} total, {unreadCount} unread)</span>
            </h1>

            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await supabase.from("messages").update({ read: true }).eq("read", false);
                  loadData("messages");
                }}
                className="mb-4 text-sm text-brand-500 hover:underline"
              >
                Mark all as read
              </button>
            )}

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-5 ${
                    !msg.read
                      ? "border-brand-200 bg-brand-50/30 dark:border-brand-900 dark:bg-brand-950/10"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.read && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{msg.name}</p>
                        <a href={`mailto:${msg.email}`} className="text-sm text-brand-500 hover:underline">
                          {msg.email}
                        </a>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mt-2">{msg.message}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-zinc-400">
                        {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <div className="flex gap-2">
                        {!msg.read && (
                          <button
                            onClick={async () => {
                              await supabase.from("messages").update({ read: true }).eq("id", msg.id);
                              loadData("messages");
                            }}
                            className="text-xs text-brand-500 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this message?")) return;
                            await supabase.from("messages").delete().eq("id", msg.id);
                            setMessages(messages.filter((m) => m.id !== msg.id));
                          }}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No messages yet. Messages from your contact form will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: RESUME
        ══════════════════════════════════════════════ */}
        {activeTab === "resume" && (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Resume</h1>
            <div className="max-w-md space-y-6">
              {/* ... resume content ... */}
              {resumeData ? (
                <Card variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Current Resume</p>
                      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{resumeData.filename}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Uploaded: {new Date(resumeData.uploaded_at).toLocaleString()}
                      </p>
                      <a
                        href={resumeData.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
                      >
                        View/Download →
                      </a>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("Remove current resume? You can upload a new one.")) return;
                        const { error } = await supabase.from("resume").delete().eq("id", resumeData.id);
                        if (error) notify("error", error.message);
                        else { setResumeData(null); notify("success", "Resume removed."); }
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No resume uploaded yet.</p>
                </div>
              )}
                <Card variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Upload New Resume</h3>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.name.endsWith(".pdf")) {
                        notify("error", "Please upload a PDF file");
                        return;
                      }
                    
                      setSaving(true);
                    
                      // unified uploadToCloudinary with resourceType="raw" for PDFs
                      const result = await uploadToCloudinary(file, "portfolio/resume", "raw");
                    
                      if (!result) {
                        notify("error", "Upload failed. Check Cloudinary configuration.");
                        setSaving(false);
                        return;
                      }
                    
                      const { error } = await supabase.from("resume").insert({
                        file_url: result.url,
                        filename: file.name,
                      });
                    
                      setSaving(false);
                      if (error) notify("error", error.message);
                      else {
                        notify("success", "Resume uploaded to Cloudinary CDN!");
                        loadData("resume");
                      }
                    }}                
                    className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 cursor-pointer"
                  />
                  <p className="text-xs text-zinc-400 mt-2">PDF format only. Your portfolio's resume link will automatically update.</p>
                </Card>
              {/* ── CRON_SECRET generator ── */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  Generate CRON_SECRET
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  Use this to protect your scheduled publish endpoint.
                  Copy the generated value into your <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.env</code> file
                  and Vercel / GitHub Actions secrets.
                </p>

                <CronSecretGenerator />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: ANALYTICS — Phase 3 P5
        ══════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* ── Provider switcher ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Analytics Provider
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Current: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  {(import.meta as any).env?.PUBLIC_ANALYTICS_PROVIDER ?? "vercel"}
                </code>
                {" "}— change by setting <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">PUBLIC_ANALYTICS_PROVIDER</code> in your environment
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "vercel",    label: "Vercel Analytics",   desc: "Auto-injected, zero config" },
                  { value: "plausible", label: "Plausible",         desc: "Privacy-focused analytics" },
                  { value: "posthog",  label: "PostHog",          desc: "Product analytics, heatmaps" },
                  { value: "umami",    label: "Umami",            desc: "Simple analytics" },
                  { value: "none",    label: "None",             desc: "Disable analytics" },
                ].map((opt) => {
                  const current = (localStorage.getItem("analytics_provider") as AnalyticsProvider) 
                    || (import.meta as any).env?.PUBLIC_ANALYTICS_PROVIDER 
                    || "vercel";
                  const isActive = current === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={`rounded-xl border p-4 flex-1 min-w-[160px] ${
                        isActive
                          ? "border-brand-500 bg-brand-500/5"
                          : "border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      <p className={`text-sm font-medium ${isActive ? "text-brand-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                        {isActive ? "✅ " : ""}{opt.label}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAnalyticsProvider(opt.value as AnalyticsProvider);
                          setAnalyticsProviderState(opt.value as AnalyticsProvider);
                          notify("success", `Analytics provider set to ${opt.label}. Refreshing page...`);
                          // Automatically refresh the page to apply the new analytics provider
                          setTimeout(() => window.location.reload(), 1000);
                        }}
                        className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 cursor-default"
                            : "bg-brand-500 text-white hover:bg-brand-600"
                        }`}
                        disabled={isActive}
                      >
                        {isActive ? "Active" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analytics stats display */}
            <AnalyticsDisplay />
          </div>
        )}
      </main>
    </div>
  );
}

