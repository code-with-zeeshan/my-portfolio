// src/components/react/MessagesTab.tsx
"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { updateItem } from "@/lib/utils";
import { useAdminCrud } from "@/lib/useAdminCrud";

export default function MessagesTab({
  messages,
  setMessages,
  loading,
  notify,
  loadData,
}: {
  messages: any[];
  setMessages: (v: any[] | ((prev: any[]) => any[])) => void;
  loading: boolean;
  notify: (type: "success" | "error", message: string) => void;
  loadData: any;
}) {
  const { handleDelete, ConfirmDialogComponent } = useAdminCrud<any>();
  const unreadCount = messages.filter((m: any) => !m.read).length;

  const handleMarkAllRead = async () => {
    await supabase.from("messages").update({ read: true }).eq("read", false);
    loadData("messages");
  };

  const handleToggleRead = async (msg: any) => {
    await supabase
      .from("messages")
      .update({ read: !msg.read })
      .eq("id", msg.id);
    setMessages((prev: any[]) =>
      updateItem(prev, msg.id, (m) => ({ ...m, read: !msg.read }))
    );
  };

  const handleDeleteMessage = (msg: any, idx: number) => {
     handleDelete(
       {
         tableName: "Message",
         itemLabel: `message from ${msg.name}`,
         item: msg,
         onDelete: async (id) => {
           const { error } = await supabase
             .from("messages")
             .delete()
             .eq("id", id);
           return error ? { error } : {};
         },
         onInsert: async (item) => {
           const { error } = await supabase.from("messages").insert(item);
           return error ? { error } : {};
         },
         onLocalDelete: () => {
           setMessages(messages.filter((m: any) => m.id !== msg.id));
         },
         onUndo: (restored: any) => {
           setMessages((prev: any[]) => {
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

  return (
    <div>
      {ConfirmDialogComponent}
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
        Messages{" "}
        <span className="text-zinc-400 font-normal text-xl">
          ({messages.length} total, {unreadCount} unread)
        </span>
      </h1>

      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          className="mb-4 text-sm text-brand-500 hover:underline"
        >
          Mark all as read
        </button>
      )}

      <div className="space-y-3">
        {messages.map((msg: any, idx: number) => (
          <div
            key={msg.id}
            className={`rounded-2xl border p-5 ${
              !msg.read
                ? "border-brand-200 bg-brand-50/30 dark:border-brand-900 dark:bg-brand-950/10"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!msg.read && (
                    <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                  )}
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {msg.name}
                  </p>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    {msg.email}
                  </a>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mt-2">
                  {msg.message}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="text-xs text-zinc-400">
                  {new Date(msg.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div className="flex gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => handleToggleRead(msg)}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(msg, idx)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500">
              No messages yet. Messages from your contact form will appear
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}