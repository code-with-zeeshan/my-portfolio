// src/components/layout/MobileNav.tsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  navLinks: NavLink[];
}

export default function MobileNav({ navLinks }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-16 border-b border-border bg-surface p-6 dark:border-border-dark dark:bg-surface-dark"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-muted transition-colors hover:text-brand-500"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-fit rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
              >
                Resume
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}