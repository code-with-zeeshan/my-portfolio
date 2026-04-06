// src/data/testimonials.ts

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "Tech Corp",
    content:
      "One of the most talented developers I've worked with. Delivered our project ahead of schedule with exceptional code quality. Highly recommended!",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    company: "StartupXYZ",
    content:
      "Their attention to detail and ability to translate complex requirements into elegant solutions is impressive. A true full-stack professional.",
  },
  {
    name: "Emily Davis",
    role: "Design Lead",
    company: "Creative Studio",
    content:
      "Fantastic collaboration experience. They bridge the gap between design and development seamlessly, always considering user experience first.",
  },
];
