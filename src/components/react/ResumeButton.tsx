// src/components/react/ResumeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  className?: string;
  label?: string;
}

export default function ResumeButton({ className = "", label = "Resume" }: Props) {
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

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}