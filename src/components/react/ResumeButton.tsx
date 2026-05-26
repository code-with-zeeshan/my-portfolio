// src/components/react/ResumeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/components/react/AnalyticsProvider";

interface Props {
  className?: string;
  label?: string;
  onClick?: () => void;
}

export default function ResumeButton({ className = "", label = "Resume", onClick }: Props) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [noResume, setNoResume] = useState(false);

  useEffect(() => {
      const fetchResume = () => {
        const removedIds: string[] = JSON.parse(
          localStorage.getItem("removed_resume_ids") || "[]"
        );
        supabase
          .from("resume")
          .select("id, file_url")
          .order("uploaded_at", { ascending: false })
          .then(({ data }) => {
            const latest = (data ?? []).find((r: any) => !removedIds.includes(r.id));
            if (latest?.file_url) {
              setResumeUrl(latest.file_url);
              setNoResume(false);
            } else {
              setResumeUrl(null);
              setNoResume(true);
            }
          });
      };

      fetchResume();

      window.addEventListener("resumeRemoved", fetchResume);
      window.addEventListener("resumeRestored", fetchResume);

      return () => {
        window.removeEventListener("resumeRemoved", fetchResume);
        window.removeEventListener("resumeRestored", fetchResume);
      };
    }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (noResume || !resumeUrl) {
      e.preventDefault();
      window.alert("No resume is added yet.");
      return;
    }
    // Track resume download event
    trackEvent("resume_download", { filename: resumeUrl });
    // Call custom onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={resumeUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {label}
    </a>
  );
}