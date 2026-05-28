// src/components/react/ProjectsTab.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ImageCropUpload from "@/components/react/ImageCropUpload";
import CloudinaryMultiUpload from "@/components/react/CloudinaryMultiUpload";
import ProjectPreviewModal from "@/components/react/ProjectPreviewModal";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import ReactIcon from "@/components/react/ReactIcon";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateItem } from "@/lib/utils";
import { useAdminCrud } from "@/lib/useAdminCrud";
import MarkdownEditor from "@/components/react/MarkdownEditor";

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
  const { handleDelete, handleAdd, handleSave, ConfirmDialogComponent } =
    useAdminCrud<any>();

  const handleAddProject = async () => {
    const updatedItems = projects.map((p: any, idx: number) => ({
      ...p,
      sort_order: idx + 2,
    }));
    
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: "New Project",
        description: "Description",
        tags: [],
        featured: false,
        sort_order: 1,
      })
      .select()
      .single();

    if (error) {
      notify("error", error.message);
    } else {
      for (const item of updatedItems) {
        await supabase
          .from("projects")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
      const sortedItems = [data, ...updatedItems].sort((a: any, b: any) => 
        (a.sort_order || 0) - (b.sort_order || 0)
      );
      setProjects(sortedItems);
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
    handleDelete(
      {
        tableName: "Project",
        itemLabel: project.title,
        item: project,
        onDelete: async (id) => {
          const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", id);
          return error ? { error } : {};
        },
        onInsert: async (item) => {
          const { error } = await supabase.from("projects").insert(item);
          return error ? { error } : {};
        },
        onLocalDelete: () => {
          const filtered = projects.filter((p: any) => p.id !== project.id);
          const reindexed = filtered.map((p: any, i: number) => ({
            ...p,
            sort_order: i + 1,
          }));
          setProjects(reindexed);
          reindexed.forEach(async (p: any) => {
            await supabase
              .from("projects")
              .update({ sort_order: p.sort_order })
              .eq("id", p.id);
          });
        },
        onUndo: (restored: any) => {
          setProjects((prev: any[]) => {
            const newArr = [...prev];
            newArr.splice(idx, 0, restored);
            const reindexed = newArr.map((p: any, i: number) => ({
              ...p,
              sort_order: i + 1,
            }));
            reindexed.forEach(async (p: any) => {
              await supabase
                .from("projects")
                .update({ sort_order: p.sort_order })
                .eq("id", p.id);
            });
            return reindexed;
          });
        },
        notify,
      },
      "Delete"
    );
  };

  const updateProjectField = (id: string, field: string, value: any) => {
    setProjects((prev) =>
      updateItem(prev, id, (p) => ({ ...p, [field]: value }))
    );
  };

  return (
    <div className="flex gap-6">
      {ConfirmDialogComponent}
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
                <Field label="Description">
                  <MarkdownEditor
                    value={editingProject.description}
                    onChange={(val: string) =>
                      setEditingProject({
                        ...editingProject,
                        description: val,
                      })
                    }
                    height={400}
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
                      .update({
                        description: editingProject.description,
                      })
                      .eq("id", editingProject.id);
                    setSavingProject(false);
                    if (error) notify("error", error.message);
                    else {
                      notify("success", "Description saved! ✅");
                      setProjectModalOpen(false);
                      setEditingProject(null);
                      setProjects((prev: any[]) =>
                        prev.map((p: any) =>
                          p.id === editingProject.id ? editingProject : p
                        )
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
              <div className="grid gap-3 md:grid-cols-3 mb-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      updateProjectField(project.id, "title", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="text"
                    value={project.start_date || ""}
                    onChange={(e) =>
                      updateProjectField(project.id, "start_date", e.target.value)
                    }
                    className={inputCls}
                    placeholder="e.g. Jan 2024"
                  />
                </Field>
                <Field label="End Date">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={project.end_date || ""}
                      onChange={(e) =>
                        updateProjectField(project.id, "end_date", e.target.value)
                      }
                      className={inputCls}
                      placeholder="e.g. Dec 2024"
                      disabled={project.end_date === "Present"}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={project.end_date === "Present"}
                        onChange={(e) =>
                          updateProjectField(
                            project.id,
                            "end_date",
                            e.target.checked ? "Present" : ""
                          )
                        }
                        className="rounded"
                      />
                      Present
                    </label>
                  </div>
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
                      updateProjectField(
                        project.id,
                        "description",
                        e.target.value
                      )
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
                      updateProjectField(project.id, "tags", newTags)
                    }
                    placeholder="e.g. React, TypeScript, Node.js"
                  />
                </Field>
                <Field label="Live URL">
                  <input
                    type="url"
                    value={project.live_url || ""}
                    onChange={(e) =>
                      updateProjectField(
                        project.id,
                        "live_url",
                        e.target.value || null
                      )
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
                      updateProjectField(
                        project.id,
                        "github_url",
                        e.target.value || null
                      )
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
                      updateProjectField(
                        project.id,
                        "outcome",
                        e.target.value || null
                      )
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Sort Order">
                  <input
                    type="number"
                    value={project.sort_order || 1}
                    onChange={(e) =>
                      updateProjectField(
                        project.id,
                        "sort_order",
                        Math.max(1, Number(e.target.value))
                      )
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
                      updateProjectField(
                        project.id,
                        "featured",
                        e.target.checked
                      )
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
                    updateProjectField(project.id, "image_url", result.url);
                    notify(
                      "success",
                      "Image uploaded! Click Save to apply."
                    );
                  }}
                  onRemove={() => {
                    updateProjectField(project.id, "image_url", null);
                  }}
                />
              </div>

              {/* ── P6: Image Gallery ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Image Gallery
                    <span className="ml-1 text-zinc-400">
                      (additional screenshots)
                    </span>
                  </label>
                  <span className="text-xs text-zinc-400">
                    {(project.gallery_images ?? []).length} images
                  </span>
                </div>

                {/* Existing gallery images */}
                {(project.gallery_images ?? []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(project.gallery_images ?? []).map(
                      (url: string, imgIdx: number) => (
                        <div
                          key={imgIdx}
                          className="relative group aspect-video overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                        >
                          <img
                            src={url}
                            alt={`Gallery ${imgIdx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProjects((prev: any[]) =>
                                updateItem(prev, project.id, (p) => ({
                                  ...p,
                                  gallery_images: (
                                    p.gallery_images ?? []
                                  ).filter(
                                    (_: unknown, i: number) => i !== imgIdx
                                  ),
                                }))
                              )
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
                      )
                    )}
                  </div>
                )}

                {/* Add to gallery */}
                {/* @ts-ignore */}
                <CloudinaryMultiUpload
                  folder="portfolio/projects/gallery"
                  onUploadMany={(urls: string[]) => {
                    setProjects((prev: any[]) =>
                      updateItem(prev, project.id, (p) => ({
                        ...p,
                        gallery_images: [...(p.gallery_images ?? []), ...urls],
                      }))
                    );
                    notify(
                      "success",
                      `Added ${urls.length} screenshots. Click Save.`
                    );
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
                  {project.live_url ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      ● Live
                    </span>
                  ) : !project.github_url ? (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      ○ No Links
                    </span>
                  ) : null}
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
            <EmptyState title="No Project Yet" description='Add your first project. Click "+ Add Project" above.' />
          )}
        </div>
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
                   <span
                      className={`mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full ${
                        project.live_url
                          ? "bg-green-500"
                          : project.featured
                          ? "bg-blue-500"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    />
                   <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors flex items-center gap-1">
                     {project.title}
                     {project.featured && (
                       <span className="text-blue-500 shrink-0">★</span>
                     )}
                   </span>
                 </button>
               ))}
             </nav>
             <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 flex flex-col gap-1">
               {[
                 { icon: "★", color: "bg-blue-500", label: "Featured" },
                 { icon: "●", color: "bg-green-500", label: "Live" },
                 { icon: "●", color: "bg-zinc-300 dark:bg-zinc-600", label: "No Links" },
               ].map(({ icon, color, label }) => (
                 <div key={label} className="flex items-center gap-1.5">
                   {icon === "★" ? (
                     <span className={`text-[10px] ${color.replace("bg-", "text-")}`}>★</span>
                   ) : (
                     <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                   )}
                   <span className="text-[10px] text-zinc-400">{label}</span>
                 </div>
               ))}
             </div>
          </div>
        </aside>
      )}
    </div>
  );
}