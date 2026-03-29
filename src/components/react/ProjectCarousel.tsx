// src/components/react/ProjectCarousel.tsx
"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";

interface Props {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = (direction: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return projects.length - 1;
        if (next >= projects.length) return 0;
        return next;
      });
      setIsAnimating(false);
    }, 300);
  };

  const project = projects[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image Area */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "scale(1.05)" : "scale(1)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        />

        {/* Navigation Arrows */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 dark:bg-zinc-900/90 dark:text-zinc-50"
          aria-label="Previous project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 dark:bg-zinc-900/90 dark:text-zinc-50"
          aria-label="Next project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {projects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50"
              }`}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="p-6"
        style={{
          opacity: isAnimating ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{project.title}</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{project.year}</span>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {project.description}
        </p>

        {project.outcome && (
          <p className="text-sm font-medium text-brand-500 mb-4">
            📈 {project.outcome}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}