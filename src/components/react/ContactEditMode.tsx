// src/components/react/ContactEditMode.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const AVAILABLE_PLATFORMS = [
  "GitHub", "LinkedIn", "X", "Instagram", "Facebook", "YouTube", "TikTok",
  "Reddit", "Pinterest", "Discord", "Telegram", "WhatsApp", "Medium", 
  "DEV.to", "StackOverflow", "CodePen", "Dribbble", "Behance", "Figma", "Slack"
];

interface SocialLink {
  platform: string;
  url: string;
}

interface Props {
  isEditMode: boolean;
  onClose: () => void;
}

export default function ContactEditMode({ isEditMode, onClose }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        supabase
          .from("personal")
          .select("email, socials")
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) {
              setEmail(data.email || "");
              setSocials(data.socials || []);
            }
          });
      }
    });
  }, []);

  if (!isEditMode || !session) return null;

  const usedPlatforms = socials.map(s => s.platform.toLowerCase());
  const availablePlatforms = AVAILABLE_PLATFORMS.filter(
    p => !usedPlatforms.includes(p.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("personal")
      .update({ email, socials })
      .eq("id", session.user.id);
    setSaving(false);
    onClose();
  };

  const addSocial = (platform: string, idx: number) => {
    const updated = [...socials];
    updated[idx] = { platform, url: "" };
    setSocials(updated);
    setShowDropdown(null);
  };

  const updateSocialUrl = (idx: number, url: string) => {
    const updated = [...socials];
    updated[idx] = { ...updated[idx], url };
    setSocials(updated);
  };

  const removeSocial = (idx: number) => {
    setSocials(socials.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Edit Contact Info
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="your@email.com"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Social Links (click label to change)
            </label>
            <div className="space-y-2">
              {socials.map((social, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(showDropdown === idx ? null : idx)}
                      className="min-w-[100px] rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      {social.platform}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 inline"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {showDropdown === idx && (
                      <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-40 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        {availablePlatforms.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => addSocial(p, idx)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => removeSocial(idx)}
                          className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => updateSocialUrl(idx, e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="https://..."
                  />
                </div>
              ))}

              {socials.length < 3 && availablePlatforms.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const newPlatform = availablePlatforms[0];
                    setSocials([...socials, { platform: newPlatform, url: "" }]);
                  }}
                  className="text-sm text-brand-500 hover:underline"
                >
                  + Add Social Link
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}