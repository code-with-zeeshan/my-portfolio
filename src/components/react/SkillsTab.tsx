"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import Field from "@/components/react/Field";
import TagInput from "@/components/react/TagInput";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { Card } from "@/components/ui/card";
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
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleAddCategory = async () => {
    for (const s of skills) {
      await supabase.from("skill_categories").update({ sort_order: s.sort_order + 1 }).eq("id", s.id);
    }
    const minSortOrder = skills.length > 0 ? Math.min(...skills.map((s: any) => s.sort_order)) : 0;
    const { data, error } = await supabase
      .from("skill_categories")
      .insert({ title: "New Category", skills: [], sort_order: minSortOrder })
      .select().single();
    if (error) {
      notify("error", error.message);
    } else {
      setSkills((prev: any[]) => [
        data,
        ...prev.map((s: any) => ({ ...s, sort_order: s.sort_order + 1 })),
      ]);
      notify("success", "Category added!");
    }
  };

  const handleSaveSkill = async (cat: any) => {
    const { error } = await supabase.from("skill_categories").update(cat).eq("id", cat.id);
    if (error) notify("error", error.message);
    else notify("success", `"${cat.title}" saved!`);
  };

  const handleDeleteSkill = (cat: any, idx: number) => {
    const deletedIdx = idx;
    showConfirm(
      "Delete Category",
      `Are you sure you want to delete "${cat.title}" category?`,
      async () => {
        const { error } = await supabase.from("skill_categories").delete().eq("id", cat.id);
        if (error) {
          notify("error", error.message);
        } else {
          const deletedCategory = cat;
          setSkills(skills.filter((s: any) => s.id !== cat.id));
          notify("success", "Category deleted");

          showUndoToast({
            message: "Category deleted",
            actionLabel: "Undo",
            duration: 5000,
            onUndo: async () => {
              const { data, error } = await supabase
                .from("skill_categories")
                .insert(deletedCategory)
                .select().single();
              if (error) {
                notify("error", "Failed to undo: " + error.message);
              } else {
                setSkills((prev: any[]) => {
                  const newArr = [...prev];
                  newArr.splice(deletedIdx, 0, data);
                  return newArr;
                });
                notify("success", "Category restored");
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
          Skills ({skills.length} categories)
        </h1>
        <button onClick={handleAddCategory} className={btnAdd}>
          + Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((cat: any, idx: number) => (
          <Card key={cat.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <Field label="Category Name">
                <input
                  type="text"
                  value={cat.title}
                  onChange={(e) =>
                    setSkills(skills.map((s: any) =>
                      s.id === cat.id ? { ...s, title: e.target.value } : s
                    ))
                  }
                  className={inputCls}
                  placeholder="e.g. Frontend"
                />
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  value={cat.sort_order}
                  onChange={(e) =>
                    setSkills(skills.map((s: any) =>
                      s.id === cat.id ? { ...s, sort_order: Number(e.target.value) } : s
                    ))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Skills (comma-separated — e.g. React, TypeScript, Node.js)">
              <TagInput
                value={cat.skills}
                onChange={(newSkills: string[]) =>
                  setSkills(skills.map((s: any) =>
                    s.id === cat.id ? { ...s, skills: newSkills } : s
                  ))
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
            <p className="text-zinc-500">No skill categories. Click "+ Add Category" above.</p>
          </div>
        )}
      </div>
    </div>
  );
}