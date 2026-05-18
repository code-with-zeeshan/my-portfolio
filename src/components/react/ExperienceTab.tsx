// src/components/react/ExperienceTab.tsx
"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import Field from "@/components/react/Field";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateItem } from "@/lib/utils";
import { useAdminCrud } from "@/lib/useAdminCrud";

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
  const { handleDelete, handleAdd, ConfirmDialogComponent } =
    useAdminCrud<any>();

  const achievementsToText = (arr: string[]) => arr.join("\n");

  const handleAddExperience = async () => {
    const updatedItems = experiences.map((e: any, idx: number) => ({
      ...e,
      sort_order: idx + 2,
    }));
    
    const { data, error } = await supabase
      .from("experiences")
      .insert({
        company: "Company Name",
        role: "Job Title",
        period: "2024 — Present",
        description: "Description here.",
        achievements: [],
        sort_order: 1,
      })
      .select()
      .single();

    if (error) {
      notify("error", error.message);
    } else {
      for (const item of updatedItems) {
        await supabase
          .from("experiences")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
      const sortedItems = [data, ...updatedItems].sort((a: any, b: any) => 
        (a.sort_order || 0) - (b.sort_order || 0)
      );
      setExperiences(sortedItems);
      notify("success", "Experience added! Edit below.");
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
    handleDelete(
      {
        tableName: "Experience",
        itemLabel: `${exp.role} at ${exp.company}`,
        item: exp,
        onDelete: async (id) => {
          const { error } = await supabase
            .from("experiences")
            .delete()
            .eq("id", id);
          return error ? { error } : {};
        },
        onInsert: async (item) => {
          const { error } = await supabase
            .from("experiences")
            .insert(item);
          return error ? { error } : {};
        },
        onLocalDelete: () => {
          const filtered = experiences.filter((x: any) => x.id !== exp.id);
          const reindexed = filtered.map((x: any, i: number) => ({
            ...x,
            sort_order: i + 1,
          }));
          setExperiences(reindexed);
          reindexed.forEach(async (x: any) => {
            await supabase
              .from("experiences")
              .update({ sort_order: x.sort_order })
              .eq("id", x.id);
          });
        },
        onUndo: (restored: any) => {
          setExperiences((prev: any[]) => {
            const newArr = [...prev];
            newArr.splice(idx, 0, restored);
            const reindexed = newArr.map((x: any, i: number) => ({
              ...x,
              sort_order: i + 1,
            }));
            reindexed.forEach(async (x: any) => {
              await supabase
                .from("experiences")
                .update({ sort_order: x.sort_order })
                .eq("id", x.id);
            });
            return reindexed;
          });
        },
        notify,
      },
      "Delete"
    );
  };

  const updateExperienceField = (id: string, field: string, value: any) => {
    setExperiences((prev) =>
      updateItem(prev, id, (e) => ({ ...e, [field]: value }))
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
          <Card
            key={exp.id}
            variant="bordered"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 gap-0"
          >
            <div className="grid gap-3 md:grid-cols-3 mb-3">
              <Field label="Role / Job Title">
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) =>
                    updateExperienceField(exp.id, "role", e.target.value)
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Company">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperienceField(exp.id, "company", e.target.value)
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Period (e.g. 2023 — Present)">
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) =>
                    updateExperienceField(exp.id, "period", e.target.value)
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
                    updateExperienceField(exp.id, "description", e.target.value)
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
                    updateExperienceField(exp.id, "achievements", rawLines);
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
                value={exp.sort_order || 1}
                onChange={(e) =>
                  updateExperienceField(
                    exp.id,
                    "sort_order",
                    Math.max(1, Number(e.target.value))
                  )
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