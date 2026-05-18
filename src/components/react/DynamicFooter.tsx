// src/components/react/DynamicFooter.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReactIcon from "@/components/react/ReactIcon";
import MagneticHover from "@/components/react/MagneticHover";

interface SocialLink {
  platform: string;
  url: string;
}

interface PersonalInfo {
  name: string;
  socials: SocialLink[];
  email: string;
}

const STATIC_FALLBACK: PersonalInfo = {
  name: "Your Name",
  socials: [
    { platform: "GitHub", url: "https://github.com/yourusername" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/yourusername" },
    { platform: "Twitter", url: "https://x.com/yourusername" },
  ],
  email: "you@email.com",
};

interface Props {
  initialData?: PersonalInfo | null;
}

export default function DynamicFooter({ initialData }: Props) {
  const [data, setData] = useState<PersonalInfo>(initialData || STATIC_FALLBACK);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Only fetch if no initial data (for client-side updates)
    if (initialData) return;
    
    supabase
      .from("personal")
      .select("name, socials, email")
      .limit(1)
      .single()
      .then(({ data: row, error }) => {
        if (!error && row) setData(row);
      });
  }, [initialData]);

  // ─── Platform name → icon/label mapping ───
const platformMap: Record<string, { icon: string; label: string }> = {
    github:       { icon: "github",       label: "GitHub"        },
    linkedin:     { icon: "linkedin",     label: "LinkedIn"     },
    x:            { icon: "x",            label: "X"            },
    twitter:      { icon: "twitter",      label: "Twitter"      },
    instagram:    { icon: "instagram",    label: "Instagram"    },
    facebook:     { icon: "facebook",     label: "Facebook"     },
    youtube:      { icon: "youtube",      label: "YouTube"      },
    tiktok:       { icon: "tiktok",       label: "TikTok"       },
    reddit:       { icon: "reddit",       label: "Reddit"       },
    pinterest:    { icon: "pinterest",    label: "Pinterest"    },
    discord:      { icon: "discord",      label: "Discord"      },
    telegram:     { icon: "telegram",     label: "Telegram"     },
    medium:       { icon: "medium",       label: "Medium"       },
    devto:        { icon: "devto",        label: "DEV.to"       },
    stackoverflow:{ icon: "stackoverflow",label: "Stack Overflow"},
    codepen:      { icon: "codepen",      label: "CodePen"      },
    dribbble:     { icon: "dribbble",     label: "Dribbble"     },
    behance:      { icon: "behance",      label: "Behance"      },
    figma:        { icon: "figma",        label: "Figma"        },
    slack:        { icon: "slack",        label: "Slack"        },
    whatsapp:     { icon: "whatsapp",     label: "WhatsApp"     },
  };

  // ─── Build social links from live Supabase data ───
  const socials = [
    ...(data.socials || []).map((s) => {
      const key = s.platform.toLowerCase();
      const mapped = platformMap[key];
      return mapped ? { href: s.url, icon: mapped.icon, label: mapped.label } : null;
    }).filter(Boolean),
    data.email && { href: `mailto:${data.email}`, icon: "mail", label: "Email" },
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
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row md:gap-8 lg:gap-6">

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
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center md:text-right shrink-0">
          &copy; {currentYear} {firstName} {lastName}. All rights reserved.
        </p>

      </div>
    </footer>
  );
}