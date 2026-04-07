// src/components/react/sections/DynamicTestimonials.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
}

const STATIC_FALLBACK: Testimonial[] = [
  { id: "1", name: "Sarah Johnson", role: "Product Manager", company: "Tech Corp", content: "One of the most talented developers I've worked with. Delivered our project ahead of schedule with exceptional code quality. Highly recommended!" },
  { id: "2", name: "Michael Chen", role: "CTO", company: "StartupXYZ", content: "Their attention to detail and ability to translate complex requirements into elegant solutions is impressive. A true full-stack professional." },
  { id: "3", name: "Emily Davis", role: "Design Lead", company: "Creative Studio", content: "Fantastic collaboration experience. They bridge the gap between design and development seamlessly, always considering user experience first." },
];

export default function DynamicTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(STATIC_FALLBACK);
  const [supabaseDown,  setSupabaseDown]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          // ✅ Supabase returned an error (likely down or misconfigured)
          console.warn("Supabase error — using static fallback:", error.message);
          setSupabaseDown(true);
        } else {
          // ✅ Supabase is reachable — use whatever it returned (even empty array)
          setTestimonials(data ?? []);
          setSupabaseDown(false);
        }
      } catch {
        // ✅ Network error — Supabase unreachable
        setSupabaseDown(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">What People Say</h2>
          </div>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <FadeIn key={t.id} delay={idx * 0.1}>
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-brand-500/30">
                  <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/>
                  <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/>
                </svg>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">"{t.content}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-500">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role} at {t.company}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}