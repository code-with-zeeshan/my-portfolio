// src/components/react/sections/DynamicSkills.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/react/StaggerChildren";
import { skillCategories as staticSkills } from "@/data/skills";

interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  sort_order: number;
}

export default function DynamicSkills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseDown,  setSupabaseDown]  = useState(false); 

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data, error } = await supabase
          .from("skill_categories")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          // ✅ Supabase returned an error (likely down or misconfigured)
          console.warn("Supabase error — using static fallback:", error.message);
          setSupabaseDown(true);
        } else {
          // ✅ Supabase is reachable — use whatever it returned (even empty array)
          setCategories(data ?? []);
          setSupabaseDown(false);
        }
      } catch {
        // ✅ Network error — Supabase unreachable
        setSupabaseDown(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  return (
    <section id="skills" className="py-24 bg-zinc-100 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Expertise</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Skills & Technologies</h2>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {categories.map((category, catIdx) => (
              <FadeIn key={category.id} delay={catIdx * 0.1}>
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{category.title}</h3>
                  <StaggerContainer className="flex flex-wrap gap-2" staggerDelay={0.06}>
                    {category.skills.map((skill, skillIdx) => (
                      <StaggerItem key={skill} index={skillIdx} staggerDelay={0.06}>
                        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {skill}
                        </span>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}