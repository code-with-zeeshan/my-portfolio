// src/components/react/AdminDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
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
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { type AnalyticsProvider } from "@/components/react/AnalyticsProvider";
import ReactIcon from "@/components/react/ReactIcon";

// ─── Extracted Components ───
import ProfileTab from "@/components/react/ProfileTab";
import ProjectsTab from "@/components/react/ProjectsTab";
import SkillsTab from "@/components/react/SkillsTab";
import ExperienceTab from "@/components/react/ExperienceTab";
import TestimonialsTab from "@/components/react/TestimonialsTab";
import BlogTab from "@/components/react/BlogTab";
import MessagesTab from "@/components/react/MessagesTab";
import ResumeTab from "@/components/react/ResumeTab";
import AnalyticsTab from "@/components/react/AnalyticsTab";
import SettingsTab from "@/components/react/SettingsTab";

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

type Tab = "personal" | "projects" | "skills" | "experience" | "blog" | "testimonials" | "messages" | "resume" | "analytics" | "settings";

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
      if (saved && ["personal", "projects", "skills", "experience", "blog", "testimonials", "messages", "resume", "analytics", "settings"].includes(saved)) {
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
  
  // ── Auth state ──
  type AuthState = "checking" | "returning" | "authenticated" | "unauthenticated";
  const [authState, setAuthState] = useState<AuthState>("checking");
  
  // For undo/confirmation system
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const [deletedItem, setDeletedItem] = useState<{
    type: string;
    data: any;
    timestamp: number;
  } | null>(null);
  useEffect(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.includes("auth") && (k.includes("supabase") || k.startsWith("sb-"))
    );
    setAuthState(key ? "returning" : "checking");
  }, []);
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
  const [resumeHistory, setResumeHistory] = useState<Resume[]>([]);

  // ── Auth ref for timeout checks ──
  const authStateRef = useRef<AuthState>("checking");
  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  useEffect(() => {
    // ── Detect returning user SYNCHRONOUSLY before any async work ──
    const sessionKey = Object.keys(localStorage).find(
      (key) => key.includes("auth") && (key.includes("supabase") || key.startsWith("sb-"))
    );
    
    if (sessionKey) {
      setAuthState("returning");
    } else {
      setAuthState("checking");
    }

    let isMounted = true;
  
    const timeoutId = setTimeout(() => {
      if (isMounted && (authStateRef.current === "returning" || authStateRef.current === "checking")) {
        console.warn("Auth timeout - checking session status");
        setAuthState("unauthenticated");
        window.location.href = "/";
      }
    }, 15000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      if (error || !session) {
        setAuthState("unauthenticated");
        window.location.href = "/";
        return;
      }
      setUser(session.user);
      setAuthState("authenticated");
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      setAuthState("unauthenticated");
      window.location.href = "/";
    });
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
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
           const { data: currentResume } = await supabase
             .from("resume")
             .select("*")
             .order("uploaded_at", { ascending: false })
             .limit(1)
             .maybeSingle();
           setResumeData(currentResume);
           const { data: history } = await supabase
             .from("resume")
             .select("*")
             .order("uploaded_at", { ascending: false });
           if (history) setResumeHistory(history ?? []);
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
    { key: "settings",     label: "Settings",     icon: "settings"  },
  ];

  const unreadCount = messages.filter((m) => !m.read).length;  

  // ─── Loading screen ───
  if (authState === "checking" || authState === "returning") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-zinc-500">
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
     {ConfirmDialogComponent}

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
            <div className="overflow-hidden ml-3">
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
                <span className="shrink-0">
                  <ReactIcon name={tab.icon} size={18} />
                </span>

                {sidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {tab.label}
                  </span>
                )}

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

      {/* Mobile warning */}
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
          <ProfileTab
            personal={personal}
            setPersonal={setPersonal}
            savingProfile={savingProfile}
            setSavingProfile={setSavingProfile}
            savingSkills={savingSkills}
            setSavingSkills={setSavingSkills}
            savingHighlights={savingHighlights}
            setSavingHighlights={setSavingHighlights}
            inputCls={inputCls}
            btnPrimary={btnPrimary}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: PROJECTS
        ══════════════════════════════════════════════ */}
        {activeTab === "projects" && (
          <ProjectsTab
            projects={projects}
            setProjects={setProjects}
            previewProject={previewProject}
            setPreviewProject={setPreviewProject}
            projectModalOpen={projectModalOpen}
            setProjectModalOpen={setProjectModalOpen}
            editingProject={editingProject}
            setEditingProject={setEditingProject}
            inputCls={inputCls}
            btnPrimary={btnPrimary}
            btnDanger={btnDanger}
            btnAdd={btnAdd}
            saving={saving}
            setSaving={setSaving}
            savingProject={savingProject}
            setSavingProject={setSavingProject}
            loading={loading}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: SKILLS
        ══════════════════════════════════════════════ */}
        {activeTab === "skills" && (
          <SkillsTab
            skills={skills}
            setSkills={setSkills}
            inputCls={inputCls}
            btnAdd={btnAdd}
            btnPrimary={btnPrimary}
            btnDanger={btnDanger}
            savingSkills={savingSkills}
            setSavingSkills={setSavingSkills}
            loading={loading}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: EXPERIENCE
        ══════════════════════════════════════════════ */}
        {activeTab === "experience" && (
          <ExperienceTab
            experiences={experiences}
            setExperiences={setExperiences}
            inputCls={inputCls}
            btnAdd={btnAdd}
            btnPrimary={btnPrimary}
            btnDanger={btnDanger}
            loading={loading}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: TESTIMONIALS
        ══════════════════════════════════════════════ */}
        {activeTab === "testimonials" && (
          <TestimonialsTab
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            inputCls={inputCls}
            btnAdd={btnAdd}
            btnPrimary={btnPrimary}
            btnDanger={btnDanger}
            loading={loading}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: BLOG
        ══════════════════════════════════════════════ */}
        {activeTab === "blog" && (
          <BlogTab
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
            previewPost={previewPost}
            setPreviewPost={setPreviewPost}
            blogModalOpen={blogModalOpen}
            setBlogModalOpen={setBlogModalOpen}
            editingBlogPost={editingBlogPost}
            setEditingBlogPost={setEditingBlogPost}
            inputCls={inputCls}
            btnPrimary={btnPrimary}
            btnDanger={btnDanger}
            btnAdd={btnAdd}
            savingBlog={savingBlog}
            setSavingBlog={setSavingBlog}
            loading={loading}
            notify={notify}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: MESSAGES
        ══════════════════════════════════════════════ */}
        {activeTab === "messages" && (
          <MessagesTab
            messages={messages}
            setMessages={setMessages}
            loading={loading}
            notify={notify}
            loadData={loadData}
          />
        )}

        {/* ══════════════════════════════════════════════
            TAB: RESUME
        ══════════════════════════════════════════════ */}
        {activeTab === "resume" && (
          <ResumeTab
             resumeData={resumeData}
             setResumeData={setResumeData}
             resumeHistory={resumeHistory}
             setResumeHistory={setResumeHistory}
             saving={saving}
             setSaving={setSaving}
             notify={notify}
             loadData={loadData}
           />
        )}

        {/* ══════════════════════════════════════════════
            TAB: ANALYTICS
        ══════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <AnalyticsTab notify={notify} />
        )}

        {/* ══════════════════════════════════════════════
            TAB: SETTINGS
        ══════════════════════════════════════════════ */}
        {activeTab === "settings" && <SettingsTab />}

      </main>
    </div>
  );
}