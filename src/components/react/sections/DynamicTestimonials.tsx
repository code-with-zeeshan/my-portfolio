// src/components/react/sections/DynamicTestimonials.tsx
"use client";

import { useSupabaseData } from "@/lib/useSupabaseData";
import { useMemo } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
}

const STATIC_FALLBACK: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "Tech Corp",
    content:
      "One of the most talented developers I've worked with. Delivered our project ahead of schedule with exceptional code quality. Highly recommended!",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "CTO",
    company: "StartupXYZ",
    content:
      "Their attention to detail and ability to translate complex requirements into elegant solutions is impressive. A true full-stack professional.",
  },
  {
    id: "3",
    name: "Emily Davis",
    role: "Design Lead",
    company: "Creative Studio",
    content:
      "Fantastic collaboration experience. They bridge the gap between design and development seamlessly, always considering user experience first.",
  },
  {
    id: "4",
    name: "David Wilson",
    role: "CEO",
    company: "TechStart",
    content:
      "Outstanding developer who consistently delivers beyond expectations. His code is clean, well-documented, and scalable.",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    role: "Engineering Manager",
    company: "BigTech Inc",
    content:
      "A rare combination of technical excellence and great communication. Made our complex project look easy.",
  },
];

export default function DynamicTestimonials() {
  const { data: testimonials, supabaseDown } = useSupabaseData<Testimonial>({
    table: "testimonials",
    select: "id, name, role, company, content, sort_order",
    order: { column: "sort_order", ascending: true },
    fallback: STATIC_FALLBACK,
  });

  const displayTestimonials = useMemo(
    () => (supabaseDown ? STATIC_FALLBACK : testimonials ?? STATIC_FALLBACK),
    [supabaseDown, testimonials],
  );

  // Each card is 340px + 24px gap = 364px
  const cardWidth = 364;
  const totalCards = displayTestimonials.length;
  const animationDuration = totalCards * 3.5;

  return (
    <section
      id="testimonials"
      className="testimonials-section py-16 md:py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 md:mb-16">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
            What People Say
          </h2>
        </div>

        {displayTestimonials.length > 0 ? (
          <div className="carousel-container">
            {/* Left fade */}
            <div className="carousel-fade carousel-fade-left" />

            {/* Sliding track */}
            <div 
              className="carousel-track"
              style={{
                animation: `slideLeft ${animationDuration}s linear infinite`,
              }}
            >
              {/* Render cards twice for seamless loop */}
              {[...displayTestimonials, ...displayTestimonials].map((item, index) => (
                <div 
                  className="testimonial-card" 
                  key={item.id + '-' + index}
                  style={{ minWidth: '340px' }}
                >
                  <div className="testimonial-stars" aria-label="5 stars">
                    ★★★★★
                  </div>
                  <p className="testimonial-text">"{item.content}"</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {item.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{item.name}</span>
                      <span className="author-role">
                        {item.role} at {item.company}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right fade */}
            <div className="carousel-fade carousel-fade-right" />
          </div>
        ) : (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No testimonials available.
          </p>
        )}
      </div>
    </section>
  );
}