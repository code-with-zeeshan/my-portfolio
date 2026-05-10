"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ImageCropUpload from "@/components/react/ImageCropUpload";
import CloudinaryMultiUpload from "@/components/react/CloudinaryMultiUpload";
import ProjectPreviewModal from "@/components/react/ProjectPreviewModal";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import ReactIcon from "@/components/react/ReactIcon";

export default function ProjectsTab({
  projects,
  setProjects,
  previewProject,
  setPreviewProject,
  projectModalOpen,
  setProjectModalOpen,
  editingProject,
  setEditingProject,
  inputCls,
  btnPrimary,
  btnDanger,
  btnAdd,
  saving,
  setSaving,
  savingProject,
  setSavingProject,
  loading,
  notify,
}: {
  projects: any[];
  setProjects: (v: any[] | ((prev: any[]) => any[])) => void;
  previewProject: any;
  setPreviewProject: (v: any) => void;
  projectModalOpen: boolean;
  setProjectModalOpen: (v: boolean) => void;
  editingProject: any;
  setEditingProject: (v: any) => void;
  inputCls: string;
  btnPrimary: string;
  btnDanger: string;
  btnAdd: string;
  saving: boolean;
  setSaving: (v: boolean) => void;
  savingProject: boolean;
  setSavingProject: (v: boolean) => void;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleAddProject = async () => {
    // Increment all existing projects' sort_order by 1
    for (const p of projects) {
      await supabase.from("projects").update({ sort_order: p.sort_order + 1 }).eq("id", p.id);
    }

    // Insert new project at the minimum sort_order (will be 1 after increment)
    const minSortOrder = projects.length > 0 ? Math.min(...projects.map((p: any) => p.sort_order)) : 0;
    const { data, error } = await supabase
      .from("projects")
      .insert({ title: "New Project", description: "Description", tags: [], featured: false, sort_order: minSortOrder })
      .select().single();
    if (error) {
      notify("error", error.message);
    } else {
      // Update local state: new item at top, increment existing items
      setProjects((prev: any[]) => [
        data,
        ...prev.map((p: any) => ({ ...p, sort_order: p.sort_order + 1 })),
      ]);
      notify("success", "Project added! Edit below.");
    }
  };

  const handleSaveProject = async (project: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        ...project,
        gallery_images: project.gallery_images ?? [],
      })
      .eq("id", project.id);
    setSaving(false);
    if (error) notify("error", error.message);
    else notify("success", `"${project.title}" saved!`);
  };

  const handleDeleteProject = (project: any, idx: number) => {
    const deletedIdx = idx;
    showConfirm(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"?`,
      async () => {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", project.id);
        if (error) {
          notify("error", error.message);
        } else {
          const deletedProject = project;
          const deletedIndex = deletedIdx;
          setProjects((prev: any[]) => prev.filter((p: any) => p.id !== project.id));
          notify("success", "Project deleted");

          // Show undo toast
          showUndoToast({
            message: "Project deleted",
            actionLabel: "Undo",
            duration: 5000,
            onUndo: async () => {
              const { error } = await supabase
                .from("projects")
                .insert(deletedProject);
              if (error) {
                notify("error", "Failed to undo: " + error.message);
              } else {
                setProjects((prev: any[]) => {
                  const newArr = [...prev];
                  newArr.splice(deletedIndex, 0, deletedProject);
                  return newArr;
                });
                notify("success", "Project restored");
              }
            },
          });
        }
      },
      { variant: "danger", confirmLabel: "Delete" }
    );
  };

  return (
    <div className="flex gap-6">
      {/* ── Project preview modal ── */}
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      {/* Project description modal */}
      {projectModalOpen && editingProject && (
        <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Edit Description — {editingProject.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setProjectModalOpen(false);
                setEditingProject(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              <ReactIcon name="x-close" size={14} />
              Close
            </button>
          </div>

          {/* Modal content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Editor */}
              <div className="flex-1 p-6">
                {/* @ts-ignore */}
                <Field label="Description">
                  <textarea
                    rows={15}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className={inputCls + " min-h-[300px]"}
                    placeholder="Project description..."
                  />
                </Field>
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setSavingProject(true);
                    const { error } = await supabase
                      .from("projects")
                      .update({ description: editingProject.description })
                      .eq("id", editingProject.id);
                    setSavingProject(false);
                    if (error) notify("error", error.message);
                    else {
                      notify("success", "Description saved! ✅");
                      setProjectModalOpen(false);
                      setEditingProject(null);
                      // Update the list
                      setProjects((prev: any[]) =>
                        prev.map((p: any) => (p.id === editingProject.id ? editingProject : p))
                      );
                    }
                  }}
                  disabled={savingProject}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
                >
                  <ReactIcon name="check-circle" size={14} />
                  {savingProject ? "Saving..." : "Save Description"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content column ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Projects ({projects.length})
          </h1>
          <button onClick={handleAddProject} className={btnAdd}>
            + Add Project
          </button>
        </div>

        <div className="space-y-4">
          {projects.map((project: any, idx: number) => (
            <Card
              key={project.id}
              id={`project-${project.id}`}
              variant="bordered"
              className="bg-white dark:bg-zinc-900 rounded-2xl scroll-mt-8 p-6 gap-0"
            >
              <div className="grid gap-3 md:grid-cols-2 mb-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, title: e.target.value } : p
                      ))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Year">
                  <input
                    type="text"
                    value={project.year || ""}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, year: e.target.value } : p
                      ))
                    }
                    className={inputCls}
                    placeholder="2025"
                  />
                </Field>
              </div>
              <div className="mb-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setProjectModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                    >
                      <ReactIcon name="expand" size={12} />
                      Expand editor
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={project.description}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, description: e.target.value } : p
                      ))
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3 mb-3">
                <Field label="Tags (comma-separated)">
                  <TagInput
                    value={project.tags}
                    onChange={(newTags: string[]) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, tags: newTags } : p
                      ))
                    }
                    placeholder="e.g. React, TypeScript, Node.js"
                  />
                </Field>
                <Field label="Live URL">
                  <input
                    type="url"
                    value={project.live_url || ""}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, live_url: e.target.value || null } : p
                      ))
                    }
                    className={inputCls}
                    placeholder="https://"
                  />
                </Field>
                <Field label="GitHub URL">
                  <input
                    type="url"
                    value={project.github_url || ""}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, github_url: e.target.value || null } : p
                      ))
                    }
                    className={inputCls}
                    placeholder="https://github.com/..."
                  />
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-2 mb-4">
                <Field label="Outcome (e.g. Increased X by 30%)">
                  <input
                    type="text"
                    value={project.outcome || ""}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, outcome: e.target.value || null } : p
                      ))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Sort Order (lower = first)">
                  <input
                    type="number"
                    value={project.sort_order}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, sort_order: Number(e.target.value) } : p
                      ))
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(e) =>
                      setProjects(projects.map((p: any) =>
                        p.id === project.id ? { ...p, featured: e.target.checked } : p
                      ))
                    }
                    className="rounded"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    Featured on homepage
                  </span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <ImageCropUpload
                  folder="portfolio/projects"
                  label="Project Image — adjust crop/framing before upload"
                  hint="Recommended: 1280×720px (16:9) — use the 16:9 crop preset"
                  currentUrl={project.image_url}
                  defaultAspect="video"
                  onUpload={(result: any) => {
                    setProjects(projects.map((p: any) =>
                      p.id === project.id ? { ...p, image_url: result.url } : p
                    ));
                    notify("success", "Image uploaded! Click Save to apply.");
                  }}
                  onRemove={() => {
                    setProjects(projects.map((p: any) =>
                      p.id === project.id ? { ...p, image_url: null } : p
                    ));
                  }}
                />
              </div>

              {/* ── P6: Image Gallery ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Image Gallery
                    <span className="ml-1 text-zinc-400">(additional screenshots)</span>
                  </label>
                  <span className="text-xs text-zinc-400">
                    {(project.gallery_images ?? []).length} images
                  </span>
                </div>

                {/* Existing gallery images */}
                {(project.gallery_images ?? []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(project.gallery_images ?? []).map((url: string, imgIdx: number) => (
                      <div
                        key={imgIdx}
                        className="relative group aspect-video overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                      >
                        <img src={url} alt={`Gallery ${imgIdx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setProjects(projects.map((p: any) =>
                              p.id === project.id
                                ? {
                                    ...p,
                                    gallery_images: (p.gallery_images ?? []).filter(
                                      (_: unknown, i: number) => i !== imgIdx
                                    ),
                                  }
                                : p
                            ))
                          }
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add to gallery */}
                {/* @ts-ignore */}
                <CloudinaryMultiUpload
                  folder="portfolio/projects/gallery"
                  onUploadMany={(urls: string[]) => {
                    setProjects(projects.map((p: any) =>
                      p.id === project.id
                        ? { ...p, gallery_images: [...(p.gallery_images ?? []), ...urls] }
                        : p
                    ));
                    notify("success", `Added ${urls.length} screenshots. Click Save.`);
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Status badges */}
                <div className="flex items-center gap-2">
                  {project.featured && (
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-500">
                      ★ Featured
                    </span>
                  )}
                  {project.live_url && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      ● Live
                    </span>
                  )}
                  {!project.live_url && !project.github_url && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                      ○ No links
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewProject(project)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ReactIcon name="eye" size={12} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleSaveProject(project)}
                    className={btnPrimary}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project, idx)}
                    className={btnDanger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {projects.length === 0 && !loading && (
            <EmptyState title="No content yet" description="Add your first item using the form above." />
          )}
        </div>
        {/* end of projects list */}
        {projects.length === 0 && !loading && (
          <EmptyState title="No content yet" description="Add your first item using the form above." />
        )}
      </div>
      {/* end flex-1 */}

      {/* ── F2: Jump list sidebar ── */}
      {projects.length > 0 && (
        <aside className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Projects
              </p>
              <span className="text-xs text-zinc-400">{projects.length}</span>
            </div>
            <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto py-1">
              {projects.map((project: any) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`project-${project.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500/40 group-hover:bg-brand-500 transition-colors" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                    {project.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}