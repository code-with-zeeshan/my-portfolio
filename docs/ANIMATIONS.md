# Animation System Documentation

## Overview

All animations in this project are **SSR-safe** — they use native browser APIs (`IntersectionObserver`, CSS transitions) instead of Framer Motion/Motion. This ensures zero React SSR errors and minimal JavaScript bundle size.

## Components

### FadeIn

**File:** `src/components/react/FadeIn.tsx`
**Usage:** Wraps any content to fade in when scrolled into view.

```astro
<FadeIn client:visible delay={0.2} direction="up">
  <div>Content fades in from below</div>
</FadeIn>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `delay` | `number` | `0` | Delay in seconds |
| `duration` | `number` | `0.5` | Animation duration |
| `direction` | `"up" \| "down" \| "left" \| "right" \| "none"` | `"up"` | Slide direction |
| `className` | `string` | `""` | Additional CSS classes |

### TextReveal

**File:** `src/components/react/TextReveal.tsx`
**Usage:** Reveals text word-by-word with blur effect.

```astro
<TextReveal client:load text="Hello World" delay={0.1} />
```

### StaggerChildren

**File:** `src/components/react/StaggerChildren.tsx`
**Usage:** Animates child elements one after another.

```astro
<StaggerContainer client:visible staggerDelay={0.08}>
  <StaggerItem index={0}>First</StaggerItem>
  <StaggerItem index={1}>Second</StaggerItem>
</StaggerContainer>
```

### SkillBar

**File:** `src/components/react/SkillBar.tsx`
**Usage:** Animated horizontal progress bars.

```astro
<SkillBar client:visible skills={[
  { name: "React", level: 95 },
  { name: "TypeScript", level: 90 },
]} />
```

### MagneticHover

**File:** `src/components/react/MagneticHover.tsx`
**Usage:** Element subtly follows cursor on hover.

```astro
<MagneticHover client:visible strength={0.4}>
  <button>Hover me</button>
</MagneticHover>
```

### ScrollProgress

**File:** `src/components/react/ScrollProgress.tsx`
**Usage:** Thin progress bar at top of page showing scroll position.

```astro
<!-- In BaseLayout.astro -->
<ScrollProgress client:load />
```

### ProjectCarousel

**File:** `src/components/react/ProjectCarousel.tsx`
**Usage:** Slideshow for featured projects with navigation.

```astro
<ProjectCarousel client:visible projects={featuredProjects} />
```

### PageTransition

**File:** `src/components/react/PageTransition.tsx`
**Usage:** Fade-in animation on page load.

```astro
<PageTransition client:load>
  <section>Page content</section>
</PageTransition>
```

## Astro Client Directives

| Directive | When to Use |
|---|---|
| `client:load` | Hero section, header components (above the fold) |
| `client:visible` | Below-the-fold sections (most animations) |
| `client:idle` | Non-critical animations |

## Architecture Note

`.astro` files use `Icons.astro` (pure SVG) for icons.
`.tsx` files can use `lucide-react` for icons.
Never import `lucide-react` in `.astro` files — it causes SSR errors.