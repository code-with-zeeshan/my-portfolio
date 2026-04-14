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
  const [resumeUrl, setResumeUrl] = useState("/resume.pdf");

  useEffect(() => {
    supabase
      .from("resume")
      .select("file_url")
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.file_url) setResumeUrl(data.file_url);
      });
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track resume download event
    trackEvent("resume_download", { filename: resumeUrl });
    // Call custom onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {label}
    </a>
  );
}