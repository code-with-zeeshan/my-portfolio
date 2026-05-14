"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageCropUpload from "@/components/react/ImageCropUpload";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import ReactIcon from "@/components/react/ReactIcon";

export default function ProfileTab({
  personal,
  setPersonal,
  savingProfile,
  setSavingProfile,
  savingSkills,
  setSavingSkills,
  savingHighlights,
  setSavingHighlights,
  inputCls,
  btnPrimary,
  notify,
}: {
  personal: any;
  setPersonal: any;
  savingProfile: boolean;
  setSavingProfile: (v: boolean) => void;
  savingSkills: boolean;
  setSavingSkills: (v: boolean) => void;
  savingHighlights: boolean;
  setSavingHighlights: (v: boolean) => void;
  inputCls: string;
  btnPrimary: string;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const { ConfirmDialogComponent } = useConfirmDialog();

  return (
    <div className="max-w-2xl space-y-6">
      {ConfirmDialogComponent}
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
            {"Use blank lines to separate paragraphs. They'll render as separate <p> tags."}
          </p>
        </div>

        {/* ── Bio fullscreen modal with formatting toolbar ── */}
        {bioModalOpen && personal && (
          <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">
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

            <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white px-6 py-2 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
              {[
                { label: "B", title: "Bold", wrap: "**", style: "font-bold" },
                { label: "I", title: "Italic", wrap: "*", style: "italic" },
                { label: "~~S~~", title: "Strikethrough", wrap: "~~", style: "line-through text-xs" },
              ].map(({ label, title, wrap, style }) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  onClick={() => {
                    const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const sel = ta.value.slice(start, end);
                    const newVal = ta.value.slice(0, start) + wrap + (sel || title) + wrap + ta.value.slice(end);
                    setPersonal({ ...personal, bio: newVal });
                    setTimeout(() => { ta.focus(); ta.selectionStart = start + wrap.length; ta.selectionEnd = end + wrap.length; }, 0);
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 ${style}`}
                >
                  {label === "~~S~~" ? <span className="line-through text-xs">S</span> : label}
                </button>
              ))}

              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

              {[
                { label: "H1", prefix: "# " },
                { label: "H2", prefix: "## " },
                { label: "H3", prefix: "### " },
              ].map(({ label, prefix }) => (
                <button
                  key={label}
                  type="button"
                  title={`Insert ${label}`}
                  onClick={() => {
                    const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
                    const newVal = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
                    setPersonal({ ...personal, bio: newVal });
                    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + prefix.length; }, 0);
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                >
                  {label}
                </button>
              ))}

              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

              {[
                { label: "• List", title: "Bullet list", prefix: "- " },
                { label: "1. List", title: "Numbered list", prefix: "1. " },
                { label: "> Quote", title: "Blockquote", prefix: "> " },
              ].map(({ label, title, prefix }) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  onClick={() => {
                    const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
                    const newVal = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
                    setPersonal({ ...personal, bio: newVal });
                    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + prefix.length; }, 0);
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 font-mono"
                >
                  {label}
                </button>
              ))}

              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

              <button
                type="button"
                title="Insert link"
                onClick={() => {
                  const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
                  if (!ta) return;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const sel = ta.value.slice(start, end) || "link text";
                  const url = window.prompt("Enter URL:", "https://");
                  if (!url) return;
                  const insertion = `[${sel}](${url})`;
                  const newVal = ta.value.slice(0, start) + insertion + ta.value.slice(end);
                  setPersonal({ ...personal, bio: newVal });
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
              >
                🔗 Link
              </button>

              <button
                type="button"
                title="Clear all formatting (keep text)"
                onClick={() => {
                  const ta = document.getElementById("bio-textarea") as HTMLTextAreaElement;
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

            <div className="border-t border-zinc-200 bg-zinc-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 shrink-0 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Live Preview
              </p>
              {personal.bio.split(/\n\n+/).map((para: string, i: number) => {
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
            hint="Square recommended (min 600×600px) — use the 1:1 crop preset"
            currentUrl={personal.profile_photo_url || null}
            defaultAspect="square"
            onUpload={(result) => {
              setPersonal({ ...personal, profile_photo_url: result.url });
              notify("success", "Photo uploaded! Click Save Profile to apply.");
            }}
            onRemove={() => {
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

        <div className="grid grid-cols-[1fr_100px_40px] gap-3 px-1">
          <span className="text-xs font-medium text-zinc-400">Skill Name</span>
          <span className="text-xs font-medium text-zinc-400 text-center">Level (0–100)</span>
          <span />
        </div>

        <div className="space-y-3">
          {personal.top_skills.map((skill: any, idx: number) => (
            <div key={idx} className="space-y-1.5">
              <div className="grid grid-cols-[1fr_100px_40px] gap-3 items-center">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => {
                    const updated = personal.top_skills.map((s: any, i: number) =>
                      i === idx ? { ...s, name: e.target.value } : s
                    );
                    setPersonal({ ...personal, top_skills: updated });
                  }}
                  placeholder="e.g. React / Next.js"
                  className={inputCls}
                />

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={skill.level}
                    onChange={(e) => {
                      const updated = personal.top_skills.map((s: any, i: number) =>
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

                <button
                  type="button"
                  onClick={() =>
                    setPersonal({
                      ...personal,
                      top_skills: personal.top_skills.filter((_: any, i: number) => i !== idx),
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 transition-colors"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

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

        <div className="grid grid-cols-[90px_1fr_90px_40px] gap-3 px-1">
          <span className="text-xs font-medium text-zinc-400">Icon Name</span>
          <span className="text-xs font-medium text-zinc-400">Label</span>
          <span className="text-xs font-medium text-zinc-400">Value</span>
          <span />
        </div>

        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p className="font-medium">Available icon names:</p>
          <div className="flex flex-wrap gap-1.5">
            {["briefcase", "calendar", "coffee", "heart", "star", "user", "mail", "github", "linkedin"].map(
              (name: string) => (
                <code key={name} className="rounded bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[11px]">
                  {name}
                </code>
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          {personal.highlights.map((h: any, idx: number) => (
            <div key={idx} className="grid grid-cols-[90px_1fr_90px_40px] gap-3 items-center">
              <input
                type="text"
                value={h.icon}
                onChange={(e) => {
                  const updated = personal.highlights.map((x: any, i: number) =>
                    i === idx ? { ...x, icon: e.target.value } : x
                  );
                  setPersonal({ ...personal, highlights: updated });
                }}
                className={inputCls + " text-xs font-mono"}
                placeholder="briefcase"
              />
              <input
                type="text"
                value={h.label}
                onChange={(e) => {
                  const updated = personal.highlights.map((x: any, i: number) =>
                    i === idx ? { ...x, label: e.target.value } : x
                  );
                  setPersonal({ ...personal, highlights: updated });
                }}
                className={inputCls}
                placeholder="Years Experience"
              />
              <input
                type="text"
                value={h.value}
                onChange={(e) => {
                  const updated = personal.highlights.map((x: any, i: number) =>
                    i === idx ? { ...x, value: e.target.value } : x
                  );
                  setPersonal({ ...personal, highlights: updated });
                }}
                className={inputCls + " text-center"}
                placeholder="5+"
              />
              <button
                type="button"
                onClick={() =>
                  setPersonal({
                    ...personal,
                    highlights: personal.highlights.filter((_: any, i: number) => i !== idx),
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 transition-colors"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>

        {personal.highlights.length === 0 && (
          <p className="text-sm text-center text-zinc-400 py-4">
            No highlights yet. Click "+ Add Highlight" above.
          </p>
        )}

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
  );
}