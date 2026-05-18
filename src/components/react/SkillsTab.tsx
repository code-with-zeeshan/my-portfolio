// src/components/react/SkillsTab.tsx
"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateItem } from "@/lib/utils";
import { useAdminCrud } from "@/lib/useAdminCrud";

export default function SkillsTab({
  skills,
  setSkills,
  inputCls,
  btnAdd,
  btnPrimary,
  btnDanger,
  savingSkills,
  setSavingSkills,
  loading,
  notify,
}: {
  skills: any[];
  setSkills: (v: any[] | ((prev: any[]) => any[])) => void;
  inputCls: string;
  btnAdd: string;
  btnPrimary: string;
  btnDanger: string;
  savingSkills: boolean;
  setSavingSkills: (v: boolean) => void;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const { handleDelete, handleAdd, ConfirmDialogComponent } =
    useAdminCrud<any>();

  const handleAddCategory = async () => {
    await handleAdd({
      tableName: "Category",
      defaultItem: {
        title: "New Category",
        skills: [],
        sort_order: 0,
      },
      onInsert: async (item) => {
        const { data, error } = await supabase
          .from("skill_categories")
          .insert(item)
          .select()
          .single();
        return error ? { error } : { data };
      },
      items: skills,
      setItems: setSkills,
      notify,
    });
  };

  const handleSaveSkill = async (cat: any) => {
    const { error } = await supabase
      .from("skill_categories")
      .update(cat)
      .eq("id", cat.id);
    if (error) notify("error", error.message);
    else notify("success", `"${cat.title}" saved!`);
  };

  const handleDeleteSkill = (cat: any, idx: number) => {
    handleDelete(
      {
        tableName: "Category",
        itemLabel: cat.title,
        item: cat,
        onDelete: async (id) => {
          const { error } = await supabase
            .from("skill_categories")
            .delete()
            .eq("id", id);
          return error ? { error } : {};
        },
        onInsert: async (item) => {
          const { error } = await supabase
            .from("skill_categories")
            .insert(item);
          return error ? { error } : {};
        },
        onLocalDelete: () => {
          const filtered = skills.filter((s: any) => s.id !== cat.id);
          const reindexed = filtered.map((s: any, i: number) => ({
            ...s,
            sort_order: i + 1,
          }));
          setSkills(reindexed);
          reindexed.forEach(async (s: any) => {
            await supabase
              .from("skill_categories")
              .update({ sort_order: s.sort_order })
              .eq("id", s.id);
          });
        },
        onUndo: (restored: any) => {
          setSkills((prev: any[]) => {
            const newArr = [...prev];
            newArr.splice(idx, 0, restored);
            const reindexed = newArr.map((s: any, i: number) => ({
              ...s,
              sort_order: i + 1,
            }));
            reindexed.forEach(async (s: any) => {
              await supabase
                .from("skill_categories")
                .update({ sort_order: s.sort_order })
                .eq("id", s.id);
            });
            return reindexed;
          });
        },
        notify,
      },
      "Delete"
    );
  };

  const updateSkillField = (id: string, field: string, value: any) => {
    setSkills((prev) =>
      updateItem(prev, id, (s) => ({ ...s, [field]: value }))
    );
  };

  return (
    <div>
      {ConfirmDialogComponent}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Skills ({skills.length} categories)
        </h1>
        <button onClick={handleAddCategory} className={btnAdd}>
          + Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((cat: any, idx: number) => (
          <Card
            key={cat.id}
            variant="bordered"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0"
          >
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <Field label="Category Name">
                <input
                  type="text"
                  value={cat.title}
                  onChange={(e) =>
                    updateSkillField(cat.id, "title", e.target.value)
                  }
                  className={inputCls}
                  placeholder="e.g. Frontend"
                />
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  value={cat.sort_order || 1}
                  onChange={(e) =>
                    updateSkillField(
                      cat.id,
                      "sort_order",
                      Math.max(1, Number(e.target.value))
                    )
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Skills (comma-separated — e.g. React, TypeScript, Node.js)">
              <TagInput
                value={cat.skills}
                onChange={(newSkills: string[]) =>
                  updateSkillField(cat.id, "skills", newSkills)
                }
                placeholder="Type a skill and press Enter or comma..."
              />
            </Field>

            <div className="mt-3 flex flex-wrap gap-2">
              {cat.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleSaveSkill(cat)}
                className={btnPrimary}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSkill(cat, idx)}
                className={btnDanger}
              >
                Delete
              </button>
            </div>
          </Card>
        ))}

        {skills.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500">
              No skill categories. Click "+ Add Category" above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}