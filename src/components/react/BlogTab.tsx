"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  isoToDatetimeLocal,
  datetimeLocalToIso,
  getUserTimezoneLabel,
  formatScheduledDate,
} from "@/lib/datetime";
import MarkdownEditor from "@/components/react/MarkdownEditor";
import BlogPreviewModal from "@/components/react/BlogPreviewModal";
import CloudinaryUpload from "@/components/react/CloudinaryUpload";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import ReactIcon from "@/components/react/ReactIcon";

export default function BlogTab({
  blogPosts,
  setBlogPosts,
  previewPost,
  setPreviewPost,
  blogModalOpen,
  setBlogModalOpen,
  editingBlogPost,
  setEditingBlogPost,
  inputCls,
  btnPrimary,
  btnDanger,
  btnAdd,
  savingBlog,
  setSavingBlog,
  loading,
  notify,
}: {
  blogPosts: any[];
  setBlogPosts: (v: any[] | ((prev: any[]) => any[])) => void;
  previewPost: any;
  setPreviewPost: (v: any) => void;
  blogModalOpen: boolean;
  setBlogModalOpen: (v: boolean) => void;
  editingBlogPost: any;
  setEditingBlogPost: (v: any) => void;
  inputCls: string;
  btnPrimary: string;
  btnDanger: string;
  btnAdd: string;
  savingBlog: boolean;
  setSavingBlog: (v: boolean) => void;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleAddPost = async () => {
    const slug = `post-${Date.now()}`;
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: "New Blog Post",
        slug,
        description: "Post description",
        content: "# New Post\n\nWrite your content here.",
        published: false,
        tags: [],
        meta_title: null,
        meta_description: null,
        og_image: null,
        scheduled_for: null,
      })
      .select()
      .single();
    if (error) {
      notify("error", error.message);
    } else {
      setBlogPosts((prev: any[]) => [data, ...prev]);
      notify("success", "Post created! Edit below.");
    }
  };

  const handleSavePost = async (post: any) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title:            post.title,
        slug:             post.slug,
        description:      post.description,
        content:          post.content,
        tags:             post.tags,
        hero_image:       post.hero_image,
        published:        post.published,
        pub_date:         post.pub_date,
        meta_title:       post.meta_title,
        meta_description: post.meta_description,
        og_image:         post.og_image,
        scheduled_for:    post.scheduled_for,
      })
      .eq("id", post.id);
    if (error) notify("error", error.message);
    else notify("success", `"${post.title}" saved!`);
  };

  const handleDeletePost = (post: any, idx: number) => {
    const deletedIndex = idx;
    showConfirm(
      "Delete Blog Post",
      `Are you sure you want to delete "${post.title}"?`,
      async () => {
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", post.id);
        if (error) {
          notify("error", error.message);
        } else {
          const deletedPost = post;
          const deletedIdx = deletedIndex;
          setBlogPosts((prev: any[]) => prev.filter((p: any) => p.id !== post.id));
          notify("success", "Post deleted");

          showUndoToast({
            message: "Post deleted",
            actionLabel: "Undo",
            duration: 5000,
            onUndo: async () => {
              const { error } = await supabase
                .from("blog_posts")
                .insert(deletedPost);
              if (error) {
                notify("error", "Failed to undo: " + error.message);
              } else {
                setBlogPosts((prev: any[]) => {
                  const newArr = [...prev];
                  newArr.splice(deletedIdx, 0, deletedPost);
                  return newArr;
                });
                notify("success", "Post restored");
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
      {/* Main content column */}
      <div className="flex-1 min-w-0">
        {/* Preview modal */}
        {previewPost && (
          <BlogPreviewModal
            post={previewPost}
            onClose={() => setPreviewPost(null)}
          />
        )}

        {/* Blog description modal */}
        {blogModalOpen && editingBlogPost && (
          <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Edit Description — {editingBlogPost.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBlogModalOpen(false);
                  setEditingBlogPost(null);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              >
                <ReactIcon name="x-close" size={14} />
                Close
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-1 p-6">
                  <Field label="Description">
                    <MarkdownEditor
                      value={editingBlogPost.description}
                      onChange={(val: string) =>
                        setEditingBlogPost({ ...editingBlogPost, description: val })
                      }
                      height={400}
                      placeholder="Post description shown in previews and SEO..."
                    />
                  </Field>
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBlogModalOpen(false);
                      setEditingBlogPost(null);
                    }}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setSavingBlog(true);
                      const { error } = await supabase
                        .from("blog_posts")
                        .update({ description: editingBlogPost.description })
                        .eq("id", editingBlogPost.id);
                      setSavingBlog(false);
                      if (error) notify("error", error.message);
                      else {
                        notify("success", "Description saved! ✅");
                        setBlogModalOpen(false);
                        setEditingBlogPost(null);
                        setBlogPosts((prev: any[]) =>
                          prev.map((p: any) =>
                            p.id === editingBlogPost.id ? editingBlogPost : p
                          )
                        );
                      }
                    }}
                    disabled={savingBlog}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
                  >
                    <ReactIcon name="check-circle" size={14} />
                    {savingBlog ? "Saving..." : "Save Description"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Blog Posts ({blogPosts.length})
          </h1>
          <button type="button" onClick={handleAddPost} className={btnAdd}>
            + New Post
          </button>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post: any, idx: number) => (
            <div
              key={post.id}
              id={`post-${post.id}`}
              className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden scroll-mt-8"
            >
            {/* Post Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    post.published
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : post.scheduled_for
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {post.published
                    ? "● Published"
                    : post.scheduled_for
                    ? "🕐 Scheduled"
                    : "○ Draft"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/{post.slug}</span>
                {post.pub_date && (
                  <span className="text-xs text-zinc-400">
                    {new Date(post.pub_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setPreviewPost(post)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              >
                <ReactIcon name="eye" size={12} />
                Preview
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Basic Fields ── */}
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title">
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, title: e.target.value } : p
                      ))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Slug (URL path — no spaces)">
                  <input
                    type="text"
                    value={post.slug}
                    onChange={(e) =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id
                          ? {
                              ...p,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, ""),
                            }
                          : p
                      ))
                    }
                    className={inputCls + " font-mono text-sm"}
                  />
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Description (shown in previews and SEO)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlogPost(post);
                      setBlogModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                  >
                    <ReactIcon name="expand" size={12} />
                    Expand editor
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={post.description}
                  onChange={(e) =>
                    setBlogPosts(blogPosts.map((p: any) =>
                      p.id === post.id ? { ...p, description: e.target.value } : p
                    ))
                  }
                  className={inputCls}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Tags">
                  <TagInput
                    value={post.tags}
                    onChange={(newTags: string[]) =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, tags: newTags } : p
                      ))
                    }
                    placeholder="e.g. Web Dev, TypeScript"
                  />
                </Field>
                <Field label="Hero Image">
                  <CloudinaryUpload
                    folder="portfolio/blog"
                    currentUrl={post.hero_image}
                    aspectRatio="video"
                    hint="Recommended: 1200×630px"
                    onUpload={(result) =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, hero_image: result.url } : p
                      ))
                    }
                    onRemove={() =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, hero_image: null } : p
                      ))
                    }
                  />
                </Field>
              </div>

              {/* ── P1: Markdown Editor ── */}
              <Field label="Content (Markdown)">
                <MarkdownEditor
                  value={post.content || ""}
                  onChange={(val) =>
                    setBlogPosts(blogPosts.map((p: any) =>
                      p.id === post.id ? { ...p, content: val } : p
                    ))
                  }
                  height={450}
                  placeholder="# Post Title&#10;&#10;Write your content in Markdown..."
                />
              </Field>

              {/* ── P3: SEO Metadata ── */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    SEO Metadata
                  </h3>
                  <span className="text-xs text-zinc-400">
                    (overrides title/description for search engines)
                  </span>
                </div>

                <Field label="Meta Title (60 chars recommended)">
                  <div className="relative">
                    <input
                      type="text"
                      value={post.meta_title || ""}
                      onChange={(e) =>
                        setBlogPosts(blogPosts.map((p: any) =>
                          p.id === post.id
                            ? { ...p, meta_title: e.target.value || null }
                            : p
                        ))
                      }
                      placeholder={`${post.title} | Your Name`}
                      maxLength={70}
                      className={inputCls + " pr-12"}
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                        (post.meta_title?.length ?? 0) > 60
                          ? "text-red-500"
                          : "text-zinc-400"
                      }`}
                    >
                      {post.meta_title?.length ?? 0}/60
                    </span>
                  </div>
                </Field>

                <Field label="Meta Description (155 chars recommended)">
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={post.meta_description || ""}
                      onChange={(e) =>
                        setBlogPosts(blogPosts.map((p: any) =>
                          p.id === post.id
                            ? { ...p, meta_description: e.target.value || null }
                            : p
                        ))
                      }
                      placeholder={post.description}
                      maxLength={170}
                      className={inputCls + " pr-16 resize-none"}
                    />
                    <span
                      className={`absolute right-3 top-3 text-xs ${
                        (post.meta_description?.length ?? 0) > 155
                          ? "text-red-500"
                          : "text-zinc-400"
                      }`}
                    >
                      {post.meta_description?.length ?? 0}/155
                    </span>
                  </div>
                </Field>

                <Field label="OG Image URL (1200×630px — for social sharing)">
                  <CloudinaryUpload
                    folder="portfolio/blog/og"
                    currentUrl={post.og_image}
                    aspectRatio="wide"
                    hint="1200×630px — shown when shared on Twitter, LinkedIn, WhatsApp"
                    onUpload={(result) =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, og_image: result.url } : p
                      ))
                    }
                    onRemove={() =>
                      setBlogPosts(blogPosts.map((p: any) =>
                        p.id === post.id ? { ...p, og_image: null } : p
                      ))
                    }
                  />
                </Field>

                {/* ── Live SEO Preview ── */}
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                    Google Preview
                  </p>
                  <p className="text-base font-medium text-blue-600 dark:text-blue-400 truncate">
                    {post.meta_title || post.title || "Post Title"}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
                    {`${typeof window !== "undefined" ? window.location.origin : "https://yoursite.com"}/blog/${post.slug}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {post.meta_description || post.description || "Post description will appear here..."}
                  </p>
                </div>
              </div>

              {/* ── P4: Scheduling + Publish Controls ── */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">

                {/* ── B2 + B3: Published toggle with confirmation + pub_date fix ── */}
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={post.published}
                    onChange={async (e) => {
                      const publishing = e.target.checked;

                      // ── B2: Confirmation before publishing ──
                      if (publishing) {
                        const confirmed = window.confirm(
                          `Publish "${post.title}"?\n\nThis will make it live on your portfolio immediately.`
                        );
                        if (!confirmed) return; // user cancelled — do nothing
                      }

                      // ── B3: Set pub_date to NOW when publishing if not already set ──
                      // Without a pub_date, Supabase ORDER BY pub_date DESC won't surface it
                      const pubDateToSet =
                        publishing && !post.pub_date
                          ? new Date().toISOString()
                          : post.pub_date;

                      // ── Optimistic UI update ──
                      setBlogPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id
                            ? {
                                ...p,
                                published: publishing,
                                pub_date: pubDateToSet,
                                // Clear schedule when manually publishing
                                scheduled_for: publishing ? null : p.scheduled_for,
                              }
                            : p
                        )
                      );

                      const { error } = await supabase
                        .from("blog_posts")
                        .update({
                          published:     publishing,
                          pub_date:      pubDateToSet,
                          scheduled_for: publishing ? null : post.scheduled_for,
                        })
                        .eq("id", post.id);

                      if (error) {
                        // ── Revert optimistic update on failure ──
                        setBlogPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id
                              ? {
                                  ...p,
                                  published:    !publishing,
                                  pub_date:     post.pub_date,
                                  scheduled_for: post.scheduled_for,
                                }
                              : p
                          )
                        );
                        notify("error", `Failed to ${publishing ? "publish" : "unpublish"}: ${error.message}`);
                      } else {
                        notify(
                          "success",
                          publishing
                            ? `"${post.title}" is now live! ✅`
                            : `"${post.title}" unpublished — saved as draft.`
                        );
                      }
                    }}
                    className="rounded accent-brand-500 cursor-pointer"
                  />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Published
                  </span>
                </label>

                {/* ── B4: Schedule picker — shows user's local timezone label ── */}
                {!post.published && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        Schedule for:
                      </label>
                      <input
                        type="datetime-local"
                        value={isoToDatetimeLocal(post.scheduled_for)}
                        onChange={(e) =>
                          setBlogPosts((prev) =>
                            prev.map((p) =>
                              p.id === post.id
                                ? { ...p, scheduled_for: datetimeLocalToIso(e.target.value) }
                                : p
                            )
                          )
                        }
                        className={inputCls + " text-xs w-auto"}
                      />
                      {post.scheduled_for && (
                        <button
                          type="button"
                          onClick={() =>
                            setBlogPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id ? { ...p, scheduled_for: null } : p
                              )
                            )
                          }
                          className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* ── Timezone label ── */}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-[11px] text-zinc-400">
                        ⏰ Times are in your local timezone:{" "}
                        <span className="font-medium text-zinc-500">
                          {getUserTimezoneLabel()}
                        </span>
                      </span>
                      {post.scheduled_for && (
                        <span className="text-[11px] text-amber-500 font-medium">
                          → Will publish: {formatScheduledDate(post.scheduled_for)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPost(post)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ReactIcon name="eye" size={12} />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePost(post)}
                    className={btnPrimary}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post, idx)}
                    className={btnDanger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
          </div>

          {blogPosts.length === 0 && !loading && (
          <EmptyState
            title="No blog posts yet"
            description="Click + New Post above to create one, or sync static MDX data."
          />
        )}
      </div>

      {/* Jump list sidebar */}
      {blogPosts.length > 0 && (
        <aside className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Posts
              </p>
              <span className="text-xs text-zinc-400">{blogPosts.length}</span>
            </div>
            <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto py-1">
              {blogPosts.map((post: any) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`post-${post.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full flex items-start gap-2 px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <span
                    className={`mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full ${
                      post.published
                        ? "bg-green-500"
                        : post.scheduled_for
                        ? "bg-amber-400"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                    {post.title}
                  </span>
                </button>
              ))}
            </nav>
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 flex flex-col gap-1">
              {[
                { color: "bg-green-500", label: "Published" },
                { color: "bg-amber-400", label: "Scheduled" },
                { color: "bg-zinc-300 dark:bg-zinc-600", label: "Draft" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
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