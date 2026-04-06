// src/data/personal.ts
export const personal = {
    name: "Mohammad Zeeshan",
    title: "Full-Stack Developer",
    tagline: "I craft modern, performant web experiences that users love.",
    bio: "I'm a passionate developer with 5+ years of experience building web applications. I specialize in React, TypeScript, and Node.js. I love turning complex problems into simple, beautiful solutions.",
    location: "New Delhi, India",
    email: "zeeshansayfyebusiness@gmail.com",
    availability: "Open to freelance & full-time opportunities",
    socials: {
      github: "https://github.com/code-with-zeeshan",
      linkedin: "https://linkedin.com/in/mohammad-zeeshan-37637a1a5",
      twitter: "https://twitter.com/yourusername",
    },
    profilePhoto: "/profile-photo.jpg",
    topSkills: [
      {"name": "React / Next.js", "level": 95},
      {"name": "TypeScript",       "level": 90},
      {"name": "Node.js",          "level": 85},
      {"name": "Tailwind CSS",     "level": 92},
      {"name": "PostgreSQL",       "level": 78},
    ],
    highlights: [
      {"icon": "briefcase", "label": "Years Experience",   "value": "5+"},
      {"icon": "calendar",  "label": "Projects Completed", "value": "30+"},
      {"icon": "coffee",    "label": "Cups of Coffee",     "value": "∞"},
      {"icon": "heart",     "label": "Happy Clients",      "value": "20+"}
    ],
  } as const;