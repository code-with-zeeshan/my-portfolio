"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import Field from "@/components/react/Field";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
export default function ExperienceTab({
  experiences,
  setExperiences,
  inputCls,
  btnAdd,
  btnPrimary,
  btnDanger,
  loading,
  notify,
}: {
  experiences: any[];
  setExperiences: (v: any[] | ((prev: any[]) => any[])) => void;
  inputCls: string;
  btnAdd: string;
  btnPrimary: string;
  btnDanger: string;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const achievementsToText = (arr: string[]) => arr.join("\n");

  const handleAddExperience = async () => {
    for (const e of experiences) {
      await supabase.from("experiences").update({ sort_order: e.sort_order + 1 }).eq("id", e.id);
    }
    const minSortOrder = experiences.length > 0 ? Math.min(...experiences.map((e: any) => e.sort_order)) : 0;
    const { data, error } = await supabase
      .from("experiences")
      .insert({ company: "Company Name", role: "Job Title", period: "2024 — Present", description: "Description here.", achievements: [], sort_order: minSortOrder })
      .select().single();
    if (error) {
      notify("error", error.message);
    } else {
      setExperiences((prev: any[]) => [
        data,
        ...prev.map((e: any) => ({ ...e, sort_order: e.sort_order + 1 })),
      ]);
      notify("success", "Experience added!");
    }
  };

  const handleSaveExperience = async (exp: any) => {
    const cleanedExp = {
      ...exp,
      achievements: exp.achievements
        .map((a: string) => a.trim())
        .filter(Boolean),
    };
    const { error } = await supabase
      .from("experiences")
      .update(cleanedExp)
      .eq("id", exp.id);

    if (!error) {
      setExperiences(
        experiences.map((x: any) => (x.id === exp.id ? cleanedExp : x))
      );
      notify("success", `"${exp.role}" at ${exp.company} saved!`);
    } else {
      notify("error", error.message);
    }
  };

  const handleDeleteExperience = (exp: any, idx: number) => {
    const deletedIdx = idx;
    showConfirm(
      "Delete Experience",
      `Are you sure you want to delete "${exp.role}" at ${exp.company}?`,
      async () => {
        const { error } = await supabase.from("experiences").delete().eq("id", exp.id);
        if (error) {
          notify("error", error.message);
        } else {
          const deletedExperience = exp;
          setExperiences(experiences.filter((x: any) => x.id !== exp.id));
          notify("success", "Experience deleted");

          showUndoToast({
            message: "Experience deleted",
            actionLabel: "Undo",
            duration: 5000,
            onUndo: async () => {
              const { error } = await supabase
                .from("experiences")
                .insert(deletedExperience);
              if (error) {
                notify("error", "Failed to undo: " + error.message);
              } else {
                setExperiences((prev: any[]) => {
                  const newArr = [...prev];
                  newArr.splice(deletedIdx, 0, deletedExperience);
                  return newArr;
                });
                notify("success", "Experience restored");
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
          Experience ({experiences.length})
        </h1>
        <button onClick={handleAddExperience} className={btnAdd}>
          + Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp: any, idx: number) => (
          <Card key={exp.id} variant="bordered" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0">
            <div className="grid gap-3 md:grid-cols-3 mb-3">
              <Field label="Role / Job Title">
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) =>
                    setExperiences(experiences.map((x: any) =>
                      x.id === exp.id ? { ...x, role: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Company">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    setExperiences(experiences.map((x: any) =>
                      x.id === exp.id ? { ...x, company: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Period (e.g. 2023 — Present)">
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) =>
                    setExperiences(experiences.map((x: any) =>
                      x.id === exp.id ? { ...x, period: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mb-3">
              <Field label="Description">
                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) =>
                    setExperiences(experiences.map((x: any) =>
                      x.id === exp.id ? { ...x, description: e.target.value } : x
                    ))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mb-4">
              <Field label="Achievements (one per line — will display as bullet points)">
                <textarea
                  rows={5}
                  value={achievementsToText(exp.achievements)}
                  onChange={(e) => {
                    const rawLines = e.target.value.split("\n");
                    setExperiences(
                      experiences.map((x: any) =>
                        x.id === exp.id ? { ...x, achievements: rawLines } : x
                      )
                    );
                  }}
                  className={inputCls}
                  placeholder={`Reduced page load time by 45%\nLed migration from CRA to Next.js\nMentored 4 junior developers`}
                />
              </Field>
              <ul className="mt-2 space-y-1">
                {exp.achievements
                  .map((a: string) => a.trim())
                  .filter(Boolean)
                  .map((a: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400">
                      • {a}
                    </li>
                  ))}
              </ul>
            </div>
            <Field label="Sort Order">
              <input
                type="number"
                value={exp.sort_order}
                onChange={(e) =>
                  setExperiences(experiences.map((x: any) =>
                    x.id === exp.id ? { ...x, sort_order: Number(e.target.value) } : x
                  ))
                }
                className={inputCls + " w-24"}
              />
            </Field>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleSaveExperience(exp)}
                className={btnPrimary}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExperience(exp, idx)}
                className={btnDanger}
              >
                Delete
              </button>
            </div>
          </Card>
        ))}

        {experiences.length === 0 && !loading && (
          <EmptyState
            title="No experiences yet"
            description="Add your first experience using the form above."
          />
        )}
      </div>
    </div>
  );
}