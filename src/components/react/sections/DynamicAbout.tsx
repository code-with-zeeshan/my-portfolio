// src/components/react/sections/DynamicAbout.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import SkillBar from "@/components/react/SkillBar";
import ReactIcon from "@/components/react/ReactIcon";
import type { TopSkill, Highlight } from "@/lib/types";
import OptimizedImage from "@/components/react/OptimizedImage";
import { formatDate } from "@/lib/utils";

interface SocialLink {
  platform: string;
  url: string;
}

interface PersonalInfo {
  id: string;
  name: string;
  bio: string;
  socials: SocialLink[];
  profile_photo_url?: string | null;
  top_skills: TopSkill[];
  highlights: Highlight[];
}

// ─── Static fallback ───
const STATIC_FALLBACK: PersonalInfo = {
  id: "static",
  name: "Your Name",
  bio: "I'm a passionate developer with 5+ years of experience building web applications. I specialize in React, TypeScript, and Node.js.\n\nI love turning complex problems into simple, beautiful solutions.",
  socials: [],
  profile_photo_url: null,
  top_skills: [
    { name: "React / Next.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "Tailwind CSS", level: 92 },
    { name: "PostgreSQL", level: 78 },
  ],
  highlights: [
    { icon: "briefcase", label: "Years Experience", value: "5+" },
    { icon: "calendar", label: "Projects Completed", value: "30+" },
    { icon: "coffee", label: "Cups of Coffee", value: "∞" },
    { icon: "heart", label: "Happy Clients", value: "20+" },
  ],
};

// ─── Bio renderer — handles \n\n paragraphs and \n line breaks ───
function BioText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 mt-4 first:mt-0">
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

// ─── Resume download handler ───
async function handleResumeDownload(resumeUrl: string | null) {
   if (!resumeUrl) {
     window.alert("No resume is added yet.");
     return;
   }
   try {
     const response = await fetch(resumeUrl);
     const blob = await response.blob();
     const blobUrl = URL.createObjectURL(blob);

     const link = document.createElement("a");
     link.href = blobUrl;
     link.download = "Resume.pdf";
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);

     // Revoke object URL after short delay to free memory
     setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
   } catch {
     // Fallback: open in new tab if download fails (e.g. cross-origin restriction)
     window.open(resumeUrl, "_blank");
   }
 }

export default function DynamicAbout() {
  const [data, setData] = useState<PersonalInfo>(STATIC_FALLBACK);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch personal info including JSONB columns
    supabase
      .from("personal")
      .select("*")
      .limit(1)
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          console.warn("DynamicAbout: Supabase fetch failed:", error.message);
          return; // keep static fallback
        }

        if (!row) {
          console.warn("DynamicAbout: No personal data found in Supabase");
          return;
        }

        setData({
          id: row.id,
          name: row.name ?? STATIC_FALLBACK.name,
          bio: row.bio ?? STATIC_FALLBACK.bio,
          socials: Array.isArray(row.socials) ? row.socials : [],
          profile_photo_url: row.profile_photo_url ?? null,
          // Explicit null/empty checks — don't silently fall back
          top_skills:
            Array.isArray(row.top_skills) && row.top_skills.length > 0
              ? row.top_skills
              : STATIC_FALLBACK.top_skills,
          highlights:
            Array.isArray(row.highlights) && row.highlights.length > 0
              ? row.highlights
              : STATIC_FALLBACK.highlights,
        });
      });

    // Fetch resume URL with removed check
    async function fetchResume() {
      const removedIds: string[] = JSON.parse(localStorage.getItem("removed_resume_ids") || "[]");
      
      let query = supabase
        .from("resume")
        .select("id, file_url")
        .order("uploaded_at", { ascending: false });

      const { data: allResumes } = await query;
      
      if (allResumes && allResumes.length > 0) {
        const validResume = allResumes.find((r: any) => !removedIds.includes(r.id));
        setResumeUrl(validResume?.file_url || null);
      } else {
        setResumeUrl(null);
      }
    }

    fetchResume();

    const handleResumeChange = () => fetchResume();
    window.addEventListener("resumeRemoved", handleResumeChange);
    window.addEventListener("resumeRestored", handleResumeChange);

    return () => {
      window.removeEventListener("resumeRemoved", handleResumeChange);
      window.removeEventListener("resumeRestored", handleResumeChange);
    };
  }, []);

  return (
    <section
      id="about"
      className="py-16 md:py-24 bg-zinc-100 dark:bg-zinc-900/50"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-10 md:mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">
              About Me
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
              Who I Am
            </h2>
          </div>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-12 lg:grid-cols-12">
          {/* ── LEFT: Photo + Skill Bars ── */}
          <FadeIn direction="left" className="md:col-span-5 lg:col-span-5">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <OptimizedImage
                  src={data.profile_photo_url}
                  alt={data.name}
                  preset="profilePhoto"
                  loading="lazy"
                  width={600}
                  height={750}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Top Skills
                </h3>
                <SkillBar skills={data.top_skills} />
              </div>
            </div>
          </FadeIn>

          {/* ── RIGHT: Bio + Highlights + CTA ── */}
          <FadeIn direction="right" className="md:col-span-7 lg:col-span-7">
            <div className="flex h-full flex-col">
              <BioText text={data.bio} />

              {/* Highlights Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {data.highlights.map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="mx-auto mb-2 flex justify-center text-brand-500">
                      <ReactIcon name={icon} size={20} />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {value}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA — Download Resume */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => handleResumeDownload(resumeUrl)}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
                >
                  <ReactIcon name="download" size={16} />
                  Download Resume
                </button>
                <a
                  href="/#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Let's Talk
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}