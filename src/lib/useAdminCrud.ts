// src/lib/useAdminCrud.ts
"use client";

import { useCallback } from "react";
import { showUndoToast } from "@/components/react/UndoToast";
import { useConfirmDialog } from "@/components/react/ConfirmDialog";

interface DeleteOptions<T> {
  tableName: string;
  itemLabel: string;
  item: T;
  onDelete: (id: string) => Promise<{ error?: { message: string } }>;
  onInsert: (item: T) => Promise<{ error?: { message: string } }>;
  onLocalDelete: () => void;
  onUndo: (item: T) => void;
  notify: (type: "success" | "error", message: string) => void;
}

interface AddItemOptions<T> {
  tableName: string;
  defaultItem: Partial<T> & { sort_order: number };
  onInsert: (
    item: Partial<T> & { sort_order: number }
  ) => Promise<{ data?: T; error?: { message: string } }>;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  notify: (type: "success" | "error", message: string) => void;
}

interface UpdateItemOptions<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  itemId: string;
  updates: Partial<T>;
  onSave: (updatedItem: T) => Promise<{ error?: { message: string } }>;
  notify: (type: "success" | "error", message: string) => void;
  label?: string;
}

export function useAdminCrud<T extends { id: string; sort_order?: number }>() {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleDelete = useCallback(
    (options: DeleteOptions<T>, confirmLabel = "Delete") => {
      const {
        tableName,
        itemLabel,
        item,
        onDelete,
        onInsert,
        onLocalDelete,
        onUndo,
        notify,
      } = options as DeleteOptions<T> & { item: T };

      const deletedItem = item;
      showConfirm(
        `Delete ${tableName}`,
        `Are you sure you want to delete "${itemLabel}"?`,
        async () => {
          const { error } = await onDelete(deletedItem.id);
          if (error) {
            notify("error", error.message);
          } else {
            onLocalDelete();
            notify("success", `${tableName} deleted`);

            showUndoToast({
              message: `${tableName} deleted`,
              actionLabel: "Undo",
              duration: 5000,
              onUndo: async () => {
                const { error: insertError } = await onInsert(deletedItem);
                if (insertError) {
                  notify("error", "Failed to undo: " + insertError.message);
                } else {
                  onUndo(deletedItem);
                  notify("success", `${tableName} restored`);
                }
              },
            });
          }
        },
        { variant: "danger", confirmLabel }
      );
    },
    [showConfirm]
  );

  const handleAdd = useCallback(
    async (options: AddItemOptions<T>) => {
      const { tableName, defaultItem, onInsert, items, setItems, notify } = options;

      const maxSortOrder = items.length > 0
        ? Math.max(...items.map((i) => (i as any).sort_order ?? 0))
        : 0;
      const newSortOrder = maxSortOrder + 1;

      const { data, error } = await onInsert({
        ...defaultItem,
        sort_order: newSortOrder,
      });

      if (error) {
        notify("error", error.message);
      } else {
        const sortedItems = [data as T, ...items].sort((a, b) =>
          ((a as any).sort_order ?? 0) - ((b as any).sort_order ?? 0)
        );
        setItems(sortedItems);
        notify("success", `${tableName} added! Edit below.`);
      }
    },
    []
  );

  const handleSave = useCallback(
    async (options: UpdateItemOptions<T>) => {
      const { items, setItems, itemId, updates, onSave, notify, label } = options;

      setItems((prev) =>
        prev.map((item) =>
          (item as any).id === itemId ? { ...item, ...updates } : item
        )
      );

      const updatedItem = items.find((i) => (i as any).id === itemId) as T;
      const { error } = await onSave({ ...updatedItem, ...updates });
      if (error) {
        notify("error", error.message);
      } else {
        notify("success", `${label || "Item"} saved!`);
      }
    },
    []
  );

  return { handleDelete, handleAdd, handleSave, ConfirmDialogComponent };
}