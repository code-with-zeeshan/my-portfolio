// src/components/react/DynamicFooter.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReactIcon from "@/components/react/ReactIcon";
import MagneticHover from "@/components/react/MagneticHover";

interface PersonalInfo {
  name: string;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string;
}

const STATIC_FALLBACK: PersonalInfo = {
  name: "Your Name",
  github_url: "https://github.com/yourusername",
  linkedin_url: "https://linkedin.com/in/yourusername",
  twitter_url: "https://x.com/yourusername",
  email: "you@email.com",
};

export default function DynamicFooter() {
  const [data, setData] = useState<PersonalInfo>(STATIC_FALLBACK);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    supabase
      .from("personal")
      .select("name, github_url, linkedin_url, twitter_url, email")
      .limit(1)
      .single()
      .then(({ data: row, error }) => {
        if (!error && row) setData(row);
      });
  }, []);

  // ─── Build social links from live Supabase data ───
  const socials = [
    data.github_url   && { href: data.github_url,   icon: "github",   label: "GitHub"      },
    data.linkedin_url && { href: data.linkedin_url, icon: "linkedin", label: "LinkedIn"    },
    data.twitter_url  && { href: data.twitter_url,  icon: "twitter",  label: "X (Twitter)" },
    data.email        && { href: `mailto:${data.email}`, icon: "mail", label: "Email"      },
  ].filter(Boolean) as { href: string; icon: string; label: string }[];

  // ─── Extract first name & last name for display ───
  const firstName = data.name.split(" ")[0] || "YN";
  const lastName = data.name.split(" ")[1] || "YN";
  // ─── Get initials for logo ───
  const initials = data.name
    .split(" ")
    .map((n) => n[0] + (n.length -1))
    .slice(0, 2)
    .join("");

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {initials}<span className="text-brand-500">.</span>
          </span>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Building modern web experiences.
          </p>
        </div>

        {/* Social Icons — live from Supabase */}
        <div className="flex items-center gap-4">
          {socials.map(({ href, icon, label }) => (
            <MagneticHover key={label} strength={0.4}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label={label}
              >
                <ReactIcon name={icon} size={18} />
              </a>
            </MagneticHover>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {currentYear} {firstName} {lastName}. All rights reserved.
        </p>

      </div>
    </footer>
  );
}