// src/components/react/ContactForm.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const { error } = await supabase.from("messages").insert(data);

      if (error) {
        console.error("Supabase error:", error);
        setStatus("error");
      } else {
        setStatus("sent");
        form.reset();
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-12 text-center dark:border-green-900 dark:bg-green-950">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
        </svg>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Message Sent!</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Thanks for reaching out. I'll get back to you soon.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm font-medium text-brand-500 hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Name</label>
          <input type="text" id="name" name="name" required className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" placeholder="John Doe"/>
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Email</label>
          <input type="email" id="email" name="email" required className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" placeholder="john@example.com"/>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Message</label>
        <textarea id="message" name="message" required rows={5} className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" placeholder="Tell me about your project..."/>
      </div>
      <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white">
        {status === "sending" ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
              <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>
            </svg>
            Send Message
          </>
        )}
      </button>
      {status === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
    </form>
  );
}