# Animation System Documentation

## Overview

All animations are **SSR-safe** — using native `IntersectionObserver` + CSS transitions instead of Framer Motion. This ensures zero hydration errors and minimal JavaScript bundle size.

## Icon Systems

This project has **two separate icon systems** for a specific architectural reason:

| Component | File | Use In | Why |
|---|---|---|---|
| `Icons.astro` | `src/components/ui/Icons.astro` | `.astro` files only | Runs server-side, pure SVG output |
| `ReactIcon.tsx` | `src/components/react/ReactIcon.tsx` | `.tsx` files only | React component for client rendering |

**Never import `Icons.astro` into a `.tsx` file.** Astro components are server-only and cannot cross into React's client-side rendering boundary. Doing so will either silently fail (no icon renders) or throw a build error.

## Animation Components

### FadeIn
Wraps content to fade in (+ slide) when scrolled into view.

```tsx
<FadeIn client:visible delay={0.2} direction="up">
  <div>Content fades in from below</div>
</FadeIn>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `delay` | `number` | `0` | Delay in seconds before animation |
| `duration` | `number` | `0.5` | Animation duration in seconds |
| `direction` | `"up" \| "down" \| "left" \| "right" \| "none"` | `"up"` | Slide direction |
| `className` | `string` | `""` | Passed to wrapper div (for grid col-span etc.) |

### TextReveal
Reveals text word-by-word with blur effect. Used in Hero section.

```tsx
<TextReveal client:load text="Hello World" delay={0.1} />
<TextReveal client:load text="Your Name" className="text-brand-500" delay={0.3} />
```

### StaggerChildren
Animates child elements one-by-one in sequence.

```tsx
<StaggerContainer client:visible staggerDelay={0.08}>
  {skills.map((skill, i) => (
    <StaggerItem key={skill} index={i} staggerDelay={0.08}>
      <span>{skill}</span>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### SkillBar
Animated horizontal progress bars. Data now comes from Supabase `personal.top_skills`.

```tsx
<SkillBar skills={[
  { name: "React", level: 95 },
  { name: "TypeScript", level: 90 },
]} />
```

### MagneticHover
Element subtly follows the cursor on hover. Used on social icons in Footer.

```tsx
<MagneticHover client:visible strength={0.4}>
  <button>Hover me</button>
</MagneticHover>
```

### ScrollProgress
Thin brand-colored bar at the top of the page showing scroll position.
Included automatically in `BaseLayout.astro` — no manual usage needed.

### PageTransition
Fade-in animation on page load. Used in `BlogLayout.astro`.

```tsx
<PageTransition client:load>
  <article>Blog post content</article>
</PageTransition>
```

## Client Directives Guide

| Directive | When to Use | Examples |
|---|---|---|
| `client:load` | Above the fold, needed immediately | Hero, Header, ScrollProgress |
| `client:visible` | Below the fold sections | About, Projects, Skills, Contact |
| `client:idle` | Non-critical, can wait | AdminGate |

## Inline Animation Pattern

For components not using the animation wrappers, animations are applied via `style` props + `IntersectionObserver`:

```tsx
const [visible, setVisible] = useState(false);
// IntersectionObserver sets visible = true on scroll

<div style={{
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : "translateY(30px)",
  transition: "opacity 0.5s ease, transform 0.5s ease",
}}>
```

This pattern is used in `DynamicProjects.tsx` (`ProjectCard`) and `SkillBar.tsx`.