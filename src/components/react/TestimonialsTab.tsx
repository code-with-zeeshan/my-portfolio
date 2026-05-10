"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import Field from "@/components/react/Field";

export default function TestimonialsTab({
  testimonials,
  setTestimonials,
  inputCls,
  btnAdd,
  btnPrimary,
  btnDanger,
  loading,
  notify,
}: {
  testimonials: any[];
  setTestimonials: (v: any[] | ((prev: any[]) => any[])) => void;
  inputCls: string;
  btnAdd: string;
  btnPrimary: string;
  btnDanger: string;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleAddTestimonial = async () => {
    for (const t of testimonials) {
      await supabase.from("testimonials").update({ sort_order: t.sort_order + 1 }).eq("id", t.id);
    }
    const minSortOrder = testimonials.length > 0 ? Math.min(...testimonials.map((t: any) => t.sort_order)) : 0;
    const { data, error } = await supabase
      .from("testimonials")
      .insert({ name: "Name", role: "Role", company: "Company", content: "Testimonial content here.", sort_order: minSortOrder })
      .select().single();
    if (error) {
      notify("error", error.message);
    } else {
      setTestimonials((prev: any[]) => [
        data,
        ...prev.map((t: any) => ({ ...t, sort_order: t.sort_order + 1 })),
      ]);
      notify("success", "Testimonial added!");
    }
  };

  const handleDeleteTestimonial = (t: any, idx: number) => {
    const deletedIdx = idx;
    showConfirm(
      "Delete Testimonial",
      `Are you sure you want to delete testimonial from "${t.name}"?`,
      async () => {
        const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
        if (error) {
          notify("error", error.message);
        } else {
          const deletedTestimonial = t;
          setTestimonials(testimonials.filter((x: any) => x.id !== t.id));
          notify("success", "Testimonial deleted");

          showUndoToast({
            message: "Testimonial deleted",
            actionLabel: "Undo",
            duration: 5000,
            onUndo: async () => {
              const { error } = await supabase
                .from("testimonials")
                .insert(deletedTestimonial);
              if (error) {
                notify("error", "Failed to undo: " + error.message);
              } else {
                setTestimonials((prev: any[]) => {
                  const newArr = [...prev];
                  newArr.splice(deletedIdx, 0, deletedTestimonial);
                  return newArr;
                });
                notify("success", "Testimonial restored");
              }
            },
          });
        }
      },
      { variant: "danger", confirmLabel: "Delete" }
    );
  };

  return (
    <div>
      {ConfirmDialogComponent}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Testimonials ({testimonials.length})
        </h1>
        <button onClick={handleAddTestimonial} className={btnAdd}>
          + Add Testimonial
        </button>
      </div>

      <div className="space-y-4">
        {testimonials.map((t: any, idx: number) => (
          <Card key={t.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-8 gap-0">
            <div className="grid gap-3 md:grid-cols-3 mb-3">
              <Field label="Name">
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    setTestimonials(testimonials.map((x: any) =>
                      x.id === t.id ? { ...x, name: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Role">
                <input
                  type="text"
                  value={t.role}
                  onChange={(e) =>
                    setTestimonials(testimonials.map((x: any) =>
                      x.id === t.id ? { ...x, role: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Company">
                <input
                  type="text"
                  value={t.company}
                  onChange={(e) =>
                    setTestimonials(testimonials.map((x: any) =>
                      x.id === t.id ? { ...x, company: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mb-3">
              <Field label="Testimonial Content">
                <textarea
                  rows={3}
                  value={t.content}
                  onChange={(e) =>
                    setTestimonials(testimonials.map((x: any) =>
                      x.id === t.id ? { ...x, content: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Sort Order">
              <input
                type="number"
                value={t.sort_order}
                onChange={(e) =>
                  setTestimonials(testimonials.map((x: any) =>
                    x.id === t.id ? { ...x, sort_order: Number(e.target.value) } : x
                  ))
                }
                className={inputCls + " w-24"}
              />
            </Field>

            <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500 italic">"{t.content}"</p>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                — {t.name}, {t.role} at {t.company}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase.from("testimonials").update(t).eq("id", t.id);
                  if (error) notify("error", error.message);
                  else notify("success", `"${t.name}" saved!`);
                }}
                className={btnPrimary}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTestimonial(t, idx)}
                className={btnDanger}
              >
                Delete
              </button>
            </div>
          </Card>
        ))}

        {testimonials.length === 0 && !loading && (
          <EmptyState
            title="No testimonials yet"
            description="Click + Add Testimonial above to create one."
          />
        )}
      </div>
    </div>
  );
}