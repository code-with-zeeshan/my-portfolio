// src/components/react/sections/DynamicExperience.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { experiences as staticExperiences } from "@/data/experience";

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

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setExperiences(data);
        } else {
          setExperiences(
            staticExperiences.map((e, i) => ({ id: `static-${i}`, ...e, sort_order: i }))
          );
        }
      } catch {
        setExperiences(
          staticExperiences.map((e, i) => ({ id: `static-${i}`, ...e, sort_order: i }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Career</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Work Experience</h2>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}