"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Card } from "@/components/ui/card";

export default function ResumeTab({
  resumeData,
  setResumeData,
  saving,
  setSaving,
  notify,
  loadData,
}: {
  resumeData: any;
  setResumeData: (v: any) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  notify: (type: "success" | "error", message: string) => void;
  loadData: any;
}) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      notify("error", "Please upload a PDF file");
      return;
    }

    setSaving(true);

    // unified uploadToCloudinary with resourceType="raw" for PDFs
    const result = await uploadToCloudinary(file, "portfolio/resume", "raw");

    if (!result) {
      notify("error", "Upload failed. Check Cloudinary configuration.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("resume").insert({
      file_url: result.url,
      filename: file.name,
    });

    setSaving(false);
    if (error) notify("error", error.message);
    else {
      notify("success", "Resume uploaded to Cloudinary CDN!");
      loadData("resume");
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove current resume? You can upload a new one.")) return;
    const { error } = await supabase.from("resume").delete().eq("id", resumeData.id);
    if (error) notify("error", error.message);
    else {
      setResumeData(null);
      notify("success", "Resume removed.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Resume</h1>
      <div className="max-w-md space-y-6">
        {resumeData ? (
          <Card variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
            <div className="flex items-start justify-between">
              <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Current Resume</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{resumeData.filename}</p>
              <p className="text-xs text-zinc-400 mt-1">
                Uploaded: {new Date(resumeData.uploaded_at).toLocaleString()}
              </p>
              <a
                href={resumeData.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
              >
                View/Download →
              </a>
            </div>
              <button
                onClick={handleRemove}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors"
              >
                Remove
              </button>
            </div>
          </Card>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
            <p className="text-zinc-500">No resume uploaded yet.</p>
          </div>
        )}
        <Card variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Upload New Resume</h3>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 cursor-pointer"
          />
          <p className="text-xs text-zinc-400 mt-2">PDF format only. Your portfolio's resume link will automatically update.</p>
        </Card>
      </div>
    </div>
  );
}