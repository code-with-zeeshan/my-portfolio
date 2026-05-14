// src/components/react/TestimonialsTab.tsx
"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import Field from "@/components/react/Field";
import { updateItem } from "@/lib/utils";
import { useAdminCrud } from "@/lib/useAdminCrud";

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
  const { handleDelete, handleAdd, ConfirmDialogComponent } =
    useAdminCrud<any>();

  const handleAddTestimonial = async () => {
    await handleAdd({
      tableName: "Testimonial",
      defaultItem: {
        name: "Name",
        role: "Role",
        company: "Company",
        content: "Testimonial content here.",
        sort_order: 0,
      },
      onInsert: async (item) => {
        const { data, error } = await supabase
          .from("testimonials")
          .insert(item)
          .select()
          .single();
        return error ? { error } : { data };
      },
      items: testimonials,
      setItems: setTestimonials,
      notify,
    });
  };

  const handleDeleteTestimonial = (t: any, idx: number) => {
    handleDelete(
      {
        tableName: "Testimonial",
        itemLabel: t.name,
        item: t,
        onDelete: async (id) => {
          const { error } = await supabase
            .from("testimonials")
            .delete()
            .eq("id", id);
          return error ? { error } : {};
        },
        onInsert: async (item) => {
          const { error } = await supabase
            .from("testimonials")
            .insert(item);
          return error ? { error } : {};
        },
        onLocalDelete: () => {
          setTestimonials(testimonials.filter((x: any) => x.id !== t.id));
        },
        onUndo: (restored: any) => {
          setTestimonials((prev: any[]) => {
            const newArr = [...prev];
            newArr.splice(idx, 0, restored);
            return newArr;
          });
        },
        notify,
      },
      "Delete"
    );
  };

  const updateTestimonialField = (id: string, field: string, value: any) => {
    setTestimonials((prev) =>
      updateItem(prev, id, (t) => ({ ...t, [field]: value }))
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
          <Card
            key={t.id}
            variant="bordered"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-8 gap-0"
          >
            <div className="grid gap-3 md:grid-cols-3 mb-3">
              <Field label="Name">
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    updateTestimonialField(t.id, "name", e.target.value)
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Role">
                <input
                  type="text"
                  value={t.role}
                  onChange={(e) =>
                    updateTestimonialField(t.id, "role", e.target.value)
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Company">
                <input
                  type="text"
                  value={t.company}
                  onChange={(e) =>
                    updateTestimonialField(t.id, "company", e.target.value)
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
                    updateTestimonialField(t.id, "content", e.target.value)
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
                  updateTestimonialField(
                    t.id,
                    "sort_order",
                    Number(e.target.value)
                  )
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
                  const { error } = await supabase
                    .from("testimonials")
                    .update(t)
                    .eq("id", t.id);
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