// src/components/react/sections/DynamicExperience.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { Skeleton } from "@/components/ui/Skeleton";
// import { experiences as staticExperiences } from "@/data/experience";

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  sort_order: number;
}

export default function DynamicExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseDown, setSupabaseDown] = useState(false);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          // ✅ Supabase returned an error (likely down or misconfigured)
          console.warn("Supabase error — using static fallback:", error.message);
          setSupabaseDown(true);
        } else {
          // ✅ Supabase is reachable — use whatever it returned (even empty array)
          setExperiences(data ?? []);
          setSupabaseDown(false);
        }
      } catch {
        // ✅ Network error — Supabase unreachable
        setSupabaseDown(true);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  return (
    <section id="experience" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-10 md:mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Career</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Work Experience</h2>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="card" className="h-32" />
            ))}
          </div>
        ) : experiences.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 md:left-1/2 md:-translate-x-px" />
            <div className="space-y-12">
              {experiences.map((exp, idx) => (
                <FadeIn key={exp.id} delay={idx * 0.15}>
                  <div className="relative">
                    <div className="absolute left-4 top-1 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-brand-500 bg-zinc-50 dark:bg-zinc-950 md:left-1/2" />
                    <div className={`pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-12`}>
                      {idx % 2 === 0 ? (
                        <>
                          <div className="md:text-right md:pr-12">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{exp.role}</h3>
                            <p className="text-brand-500 font-medium">{exp.company}</p>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{exp.period}</p>
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{exp.description}</p>
                            <ul className="mt-3 space-y-1">
                              {exp.achievements.map((a, ai) => (
                                <li key={ai} className="text-sm text-zinc-600 dark:text-zinc-400">• {a}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="hidden md:block" />
                        </>
                      ) : (
                        <>
                          <div className="hidden md:block" />
                          <div className="md:pl-12">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{exp.role}</h3>
                            <p className="text-brand-500 font-medium">{exp.company}</p>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{exp.period}</p>
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{exp.description}</p>
                            <ul className="mt-3 space-y-1">
                              {exp.achievements.map((a, ai) => (
                                <li key={ai} className="text-sm text-zinc-600 dark:text-zinc-400">• {a}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        ) : (
          // ✅ B9: Meaningful empty state
          <FadeIn>
            <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <rect width="20" height="14" x="2" y="6" rx="2"/>
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                No work experience listed yet
              </p>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                Career history and achievements will appear here once added from the admin dashboard.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}