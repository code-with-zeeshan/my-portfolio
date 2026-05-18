"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import ReactIcon from "@/components/react/ReactIcon";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";

export default function ResumeTab({
  resumeData,
  setResumeData,
  resumeHistory,
  setResumeHistory,
  saving,
  setSaving,
  notify,
  loadData,
}: {
  resumeData: any;
  setResumeData: (v: any) => void;
  resumeHistory: any[];
  setResumeHistory: (v: any[] | ((prev: any[]) => any[])) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  notify: (type: "success" | "error", message: string) => void;
  loadData: any;
}) {
  const [activeView, setActiveView] = useState<"current" | "history">("current");
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

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
      showConfirm(
        "Remove Resume",
        "Remove current resume? It will remain in history unless you delete it.",
        async () => {
          // Store removed resume ID in localStorage so it stays in history across refreshes
          const removedIds: string[] = JSON.parse(
            localStorage.getItem("removed_resume_ids") || "[]"
          );
          localStorage.setItem(
            "removed_resume_ids",
            JSON.stringify([...removedIds, resumeData.id])
          );
          setResumeData(null);
          notify("success", "Resume removed. It is still available in History.");
          // Dispatch event so ResumeButton components update reactively
          window.dispatchEvent(new Event("resumeRemoved"));
        },
        { variant: "danger", confirmLabel: "Remove" }
      );
    };

  const handleRestore = async (historyItem: any) => {
      showConfirm(
        "Restore Resume",
        `Restore "${historyItem.filename}" as the current resume?`,
        async () => {
          setSaving(true);
          // Re-insert the historical record as a new entry so the full history is preserved
          const { error } = await supabase.from("resume").insert({
            file_url: historyItem.file_url,
            filename: historyItem.filename,
          });
          setSaving(false);

          if (error) {
            notify("error", error.message);
          } else {
            // Remove the old "removed" marker so it doesn't linger in history
            const removedIds: string[] = JSON.parse(
              localStorage.getItem("removed_resume_ids") || "[]"
            );
            localStorage.setItem(
              "removed_resume_ids",
              JSON.stringify(removedIds.filter((id: string) => id !== historyItem.id))
            );
            // Delete the old record from the DB since it's been superseded
            await supabase.from("resume").delete().eq("id", historyItem.id);

            notify("success", `"${historyItem.filename}" restored as current resume!`);
            // Dispatch event so ResumeButton components update reactively
            window.dispatchEvent(new Event("resumeRestored"));
            loadData("resume");
          }
        },
        { confirmLabel: "Restore" }
      );
    };

  const handleDeleteHistory = async (historyItem: any) => {
     showConfirm(
       "Delete Resume",
       `Permanently delete "${historyItem.filename}" from history?`,
       async () => {
         const { error } = await supabase.from("resume").delete().eq("id", historyItem.id);
         if (error) {
           notify("error", error.message);
         } else {
           setResumeHistory((prev) => prev.filter((h: any) => h.id !== historyItem.id));
           notify("success", `"${historyItem.filename}" deleted from history.`);
         }
       },
       { variant: "danger", confirmLabel: "Delete" }
     );
   };

  // History entries are all records except the current one
  const historyEntries = resumeHistory.filter(
    (h: any) => h.id !== resumeData?.id
  );

  return (
    <div>
      {ConfirmDialogComponent}
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Resume</h1>

      {/* ── Tabs: Current / History ── */}
      <div className="flex items-center gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveView("current")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "current"
              ? "text-zinc-900 dark:text-zinc-50 border-b-2 border-brand-500"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Current
        </button>
        <button
          type="button"
          onClick={() => setActiveView("history")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "history"
              ? "text-zinc-900 dark:text-zinc-50 border-b-2 border-brand-500"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          History ({historyEntries.length})
        </button>
      </div>

      <div className="max-w-md space-y-6">
        {/* ── Current Resume ── */}
        {activeView === "current" && (
          <>
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

            {/* ── Upload (only on Current tab) ── */}
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
          </>
        )}

        {/* ── Resume History ── */}
        {activeView === "history" && (
          <>
            {historyEntries.length > 0 ? (
              <div className="space-y-4">
                {historyEntries.map((entry: any) => (
                  <Card
                    key={entry.id}
                    variant="bordered"
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-4 gap-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{entry.filename}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          Uploaded: {new Date(entry.uploaded_at).toLocaleString()}
                        </p>
                        <a
                          href={entry.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
                        >
                          View/Download →
                        </a>
                      </div>
                      <div className="flex gap-2">
                         <button
                           onClick={() => handleRestore(entry)}
                           className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950/30 transition-colors"
                         >
                           <ReactIcon name="refresh-ccw" size={12} className="mr-1" />
                           Restore
                         </button>
                         <button
                           onClick={() => handleDeleteHistory(entry)}
                           className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors"
                         >
                           <ReactIcon name="trash" size={12} className="mr-1" />
                           Delete
                         </button>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No history yet"
                description="Older versions of your resume will appear here after you upload new ones."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}