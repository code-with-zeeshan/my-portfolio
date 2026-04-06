// src/components/react/AdminDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import CloudinaryUpload from "@/components/react/CloudinaryUpload";

// ─── Types ───
interface TopSkill {
  name: string;
  level: number;
}

interface Highlight {
  icon: string;
  label: string;
  value: string;
}

interface PersonalInfo {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  availability: string;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  profile_photo_url: string | null;
  top_skills: TopSkill[];
  highlights: Highlight[];
}

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

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  year: string | null;
  outcome: string | null;
  sort_order: number;
}

interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  sort_order: number;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  sort_order: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  hero_image: string | null;
  published: boolean;
  pub_date: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  sort_order: number;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Resume {
  id: string;
  file_url: string;
  filename: string;
  uploaded_at: string;
}

type Tab = "personal" | "projects" | "skills" | "experience" | "blog" | "testimonials" | "messages" | "resume";

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

export default function AdminDashboard() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; synced: string[]; errors: string[] } | null>(null);
  const inputCls = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
  const btnPrimary = "rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 dark:bg-zinc-50 dark:text-zinc-900 transition-colors";
  const btnDanger = "rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors";
  const btnAdd = "rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors";

  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  // Data
  const [personal, setPersonal] = useState<PersonalInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeData, setResumeData] = useState<Resume | null>(null);

  // ─── Auth ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = "/"; return; }
      setUser(session.user);
      setLoading(false);
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
            console.log("Loaded personal data:", data);
        
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "personal", label: "Profile", icon: "👤" },
    { key: "projects", label: "Projects", icon: "💼" },
    { key: "skills", label: "Skills", icon: "⚡" },
    { key: "experience", label: "Experience", icon: "📋" },
    { key: "blog", label: "Blog", icon: "📝" },
    { key: "testimonials", label: "Testimonials", icon: "💬" },
    { key: "messages", label: "Messages", icon: "📧" },
    { key: "resume", label: "Resume", icon: "📄" },
  ];

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-zinc-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── SIDEBAR ── */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col overflow-y-auto z-10">
        <div className="mb-6">
          <a href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:text-brand-500 transition-colors">
            M7Z6<span className="text-brand-500">.</span> Admin
          </a>
          <p className="mt-0.5 text-xs text-zinc-500 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                activeTab === tab.key
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              {tab.key === "messages" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={async () => {
            setSyncing(true);
            setSyncResult(null);
            try {
              const response = await fetch("/api/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              const result = await response.json();

              setSyncResult(result);

              if (result.success) {
                notify("success", `Synced: ${result.synced.join(", ")}`);
                // Reload current tab data
                await loadData(activeTab);
              } else {
                notify("error", `Sync errors: ${result.errors.join(", ")}`);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
              setSyncResult({ success: false, errors: [errorMessage], synced: [] });
              notify("error", `Sync failed: ${errorMessage}`);
            }
            setSyncing(false);
          }}
          disabled={syncing}
          className="w-full rounded-xl bg-brand-500/10 px-3 py-2.5 text-left text-sm font-medium text-brand-500 hover:bg-brand-500/20 transition-colors disabled:opacity-50"
          title="Import your TypeScript static data files into Supabase. Safe to run multiple times — won't overwrite existing data."
        >
          {syncing ? "⏳ Syncing..." : "⬆ Sync Static Data"}
        </button>
          {syncResult && (
            <div className={`mt-2 rounded-lg p-2 text-xs ${syncResult.success ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
              {syncResult.success ? "✅" : "❌"}{" "}
              {syncResult.synced.length > 0 && `Synced: ${syncResult.synced.join(", ")}. `}
              {syncResult.errors.length > 0 && `Errors: ${syncResult.errors.join(", ")}`}
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <a href="/" target="_blank" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            ↗ View Portfolio
          </a>
          <button onClick={handleLogout} className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-60 flex-1 p-8 min-h-screen">

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

              <Field label="Bio">
                <textarea
                  rows={4}
                  value={personal.bio}
                  onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Profile Photo">
                <CloudinaryUpload
                  folder="portfolio/profile"
                  currentUrl={personal.profile_photo_url || null}
                  aspectRatio="square"
                  hint="Square image recommended (min 600×600px). Auto-cropped to face."
                  onUpload={(result) => {
                    setPersonal({ ...personal, profile_photo_url: result.url });
                    notify("success", "Photo uploaded! Click Save Profile to apply.");
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

              {/* Save ONLY basic fields — never touches top_skills or highlights */}
              <button
                type="button"
                onClick={async () => {
                  setSaving(true);
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
                    profile_photo_url: personal.profile_photo_url,
                  }).eq("id", personal.id);
                  setSaving(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Profile saved!");
                }}
                disabled={saving}
                className={btnPrimary + " px-6 py-3 text-sm"}
              >
                {saving ? "Saving..." : "Save Profile"}
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

              {/* Saves ONLY top_skills — isolated from other fields */}
              <button
                type="button"
                onClick={async () => {
                  setSaving(true);
                  const { error } = await supabase
                    .from("personal")
                    .update({ top_skills: personal.top_skills })
                    .eq("id", personal.id);
                  setSaving(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Top skills saved! ✅");
                }}
                disabled={saving}
                className={btnPrimary}
              >
                {saving ? "Saving..." : "Save Top Skills"}
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

              {/* Saves ONLY highlights — isolated from other fields */}
              <button
                type="button"
                onClick={async () => {
                  setSaving(true);
                  const { error } = await supabase
                    .from("personal")
                    .update({ highlights: personal.highlights })
                    .eq("id", personal.id);
                  setSaving(false);
                  if (error) notify("error", error.message);
                  else notify("success", "Highlights saved! ✅");
                }}
                disabled={saving}
                className={btnPrimary}
              >
                {saving ? "Saving..." : "Save Highlights"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: PROJECTS (Edit + Add + Delete)
        ══════════════════════════════════════════════ */}
        {activeTab === "projects" && (
          <div>
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
                <div key={project.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="grid gap-3 md:grid-cols-2 mb-3">
                    <Field label="Title">
                      <input type="text" value={project.title} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, title: e.target.value } : p))} className={inputCls} />
                    </Field>
                    <Field label="Year">
                      <input type="text" value={project.year || ""} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, year: e.target.value } : p))} className={inputCls} placeholder="2025" />
                    </Field>
                  </div>
                  <div className="mb-3">
                    <Field label="Description">
                      <textarea rows={2} value={project.description} onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, description: e.target.value } : p))} className={inputCls} />
                    </Field>
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
                    <CloudinaryUpload
                      label="Project Image (auto-optimized via Cloudinary)"
                      folder="portfolio/projects"
                      currentUrl={project.image_url}
                      aspectRatio="video"
                      hint="Recommended: 1280×720px (16:9). Auto-converted to WebP for performance."
                      onUpload={(result) => {
                        setProjects(projects.map((p) =>
                          p.id === project.id ? { ...p, image_url: result.url } : p
                        ));
                        notify("success", "Image uploaded! Click Save to apply.");
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setSaving(true);
                        const { error } = await supabase.from("projects").update(project).eq("id", project.id);
                        setSaving(false);
                        if (error) notify("error", error.message);
                        else notify("success", `"${project.title}" saved!`);
                      }}
                      className={btnPrimary}
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${project.title}"?`)) return;
                        const { error } = await supabase.from("projects").delete().eq("id", project.id);
                        if (error) notify("error", error.message);
                        else { setProjects(projects.filter((p) => p.id !== project.id)); notify("success", "Project deleted"); }
                      }}
                      className={btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {projects.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No projects yet. Click "Add Project" above.</p>
                </div>
              )}
            </div>
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
                <div key={cat.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
                </div>
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
                <div key={exp.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
                    <Field label="Achievements (one per line — will display as bullet points)">
                      <textarea
                        rows={4}
                        value={exp.achievements.join("\n")}
                        onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, achievements: e.target.value.split("\n").map((a) => a.trim()).filter(Boolean), } : x))}
                        className={inputCls}
                        placeholder={`Reduced page load time by 45%\nLed migration from CRA to Next.js\nMentored 4 junior developers`}
                      />
                    </Field>
                    {/* Preview */}
                    <ul className="mt-2 space-y-1">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400">• {a}</li>
                      ))}
                    </ul>
                  </div>
                  <Field label="Sort Order">
                    <input type="number" value={exp.sort_order} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, sort_order: Number(e.target.value) } : x))} className={inputCls + " w-24"} />
                  </Field>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from("experiences").update(exp).eq("id", exp.id);
                        if (error) notify("error", error.message);
                        else notify("success", `"${exp.role}" at ${exp.company} saved!`);
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
                </div>
              ))}

              {experiences.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No experiences yet. Click "+ Add Experience" above.</p>
                </div>
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
                <div key={t.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
                </div>
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
            TAB: BLOG — Full CRUD
        ══════════════════════════════════════════════ */}
        {activeTab === "blog" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Blog Posts ({blogPosts.length})</h1>
              <button
                onClick={async () => {
                  const slug = `post-${Date.now()}`;
                  const { data, error } = await supabase
                    .from("blog_posts")
                    .insert({ title: "New Post", slug, description: "Post description", content: "# New Post\n\nWrite your content here.", published: false, tags: [] })
                    .select().single();
                  if (error) notify("error", error.message);
                  else { setBlogPosts((p) => [data, ...p]); notify("success", "Post created! Edit below."); }
                }}
                className={btnAdd}
              >
                + New Post
              </button>
            </div>

            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${post.published ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {post.published ? "● Published" : "○ Draft"}
                    </span>
                    <span className="text-xs text-zinc-400">{new Date(post.pub_date).toLocaleDateString()}</span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 mb-3">
                    <Field label="Title">
                      <input type="text" value={post.title} onChange={(e) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, title: e.target.value } : p))} className={inputCls} />
                    </Field>
                    <Field label="Slug (URL path)">
                      <input type="text" value={post.slug} onChange={(e) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, slug: e.target.value } : p))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="mb-3">
                    <Field label="Description (SEO summary)">
                      <input type="text" value={post.description} onChange={(e) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, description: e.target.value } : p))} className={inputCls} />
                    </Field>
                    <CloudinaryUpload
                      label="Hero Image"
                      folder="portfolio/blog"
                      currentUrl={post.hero_image}
                      aspectRatio="video"
                      hint="Recommended: 1200×630px. Auto-optimized for web."
                      onUpload={(result) => {
                        setBlogPosts(blogPosts.map((p) =>
                          p.id === post.id ? { ...p, hero_image: result.url } : p
                        ));
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <Field label="Tags (comma-separated)">
                      <TagInput
                        value={post.tags}
                        onChange={(newTags) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, tags: newTags } : p))}
                        placeholder="e.g. Web Dev, TypeScript"
                      />
                    </Field>
                  </div>
                  <div className="mb-4">
                    <Field label="Content (Markdown)">
                      <textarea
                        rows={10}
                        value={post.content}
                        onChange={(e) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, content: e.target.value } : p))}
                        className={inputCls + " font-mono text-xs"}
                        placeholder={`# Post Title\n\nWrite your content in Markdown...`}
                      />
                    </Field>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={post.published}
                        onChange={(e) => setBlogPosts(blogPosts.map((p) => p.id === post.id ? { ...p, published: e.target.checked } : p))}
                        className="rounded"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">Published (visible on site)</span>
                    </label>

                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={async () => {
                          const { error } = await supabase.from("blog_posts").update(post).eq("id", post.id);
                          if (error) notify("error", error.message);
                          else notify("success", `"${post.title}" saved!`);
                        }}
                        className={btnPrimary}
                      >
                        Save
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
                          const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
                          if (error) notify("error", error.message);
                          else { setBlogPosts(blogPosts.filter((p) => p.id !== post.id)); notify("success", "Post deleted"); }
                        }}
                        className={btnDanger}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {blogPosts.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">No blog posts yet. Click "+ New Post" above.</p>
                </div>
              )}
            </div>
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
            {resumeData ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <p className="text-zinc-500">No resume uploaded yet.</p>
              </div>
            )}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
