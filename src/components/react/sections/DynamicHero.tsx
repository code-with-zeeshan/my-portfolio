// src/components/react/sections/DynamicHero.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import TextReveal from "@/components/react/TextReveal";

interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  location: string;
  availability: string;
}

// Static fallback data
const STATIC_FALLBACK: PersonalInfo = {
  name: "Your Name",
  title: "Full-Stack Developer",
  tagline: "I craft modern, performant web experiences that users love.",
  location: "San Francisco, CA",
  availability: "Open to freelance & full-time opportunities",
};

export default function DynamicHero() {
  const [data, setData] = useState<PersonalInfo>(STATIC_FALLBACK);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: row, error } = await supabase
          .from("personal")
          .select("name, title, tagline, location, availability")
          .limit(1)
          .single();

        if (!error && row) {
          setData(row);
        }
      } catch {
        // Keep fallback data
      }
    }
    fetchData();
  }, []);

  return (
    <section id="hero" className="relative flex min-h-[90vh] items-center pt-16">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <FadeIn delay={0}>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
            </span>
            {data.availability}
          </div>
        </FadeIn>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-50">
          <TextReveal text="Hi, I'm" delay={0.1} />
          {" "}
          <TextReveal text={data.name} className="text-brand-500" delay={0.3} />
        </h1>

        <FadeIn delay={0.5}>
          <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400 sm:text-2xl lg:text-3xl font-light">
            {data.title}
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {data.tagline}
          </p>
        </FadeIn>

        <FadeIn delay={0.7}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/#projects" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white">
              View My Work
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </a>
            <a href="/#contact" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Get In Touch
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.8}>
          <div className="mt-6 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            {data.location}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}