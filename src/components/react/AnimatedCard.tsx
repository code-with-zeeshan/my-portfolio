// src/components/react/AnimatedCard.tsx
import { motion } from "motion/react";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/data/projects";

interface Props {
  project: Project;
  index: number;
}

export default function AnimatedCard({ project, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white dark:border-border-dark dark:bg-zinc-900"
    >
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Hover Links */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white p-2.5 text-zinc-900 shadow-lg transition-transform hover:scale-110"
              aria-label={`Visit ${project.title} live`}
            >
              <ExternalLink size={16} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white p-2.5 text-zinc-900 shadow-lg transition-transform hover:scale-110"
              aria-label={`View ${project.title} source`}
            >
              <Github size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <span className="text-xs text-muted">{project.year}</span>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        {project.outcome && (
          <p className="mb-4 text-sm font-medium text-brand-500">
            📈 {project.outcome}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}