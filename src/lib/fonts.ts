export interface FontOption {
  name: string;
  family: string;
  cssFamily: string;
  importPath: string;
}

export const FONTS: FontOption[] = [
  {
    name: "Inter",
    family: "Inter Variable",
    cssFamily: '"Inter Variable", "Inter", system-ui, -apple-system, sans-serif',
    importPath: "@fontsource-variable/inter",
  },
  {
    name: "Onest",
    family: "Onest Variable",
    cssFamily: '"Onest Variable", "Onest", system-ui, -apple-system, sans-serif',
    importPath: "@fontsource-variable/onest",
  },
  {
    name: "Outfit",
    family: "Outfit Variable",
    cssFamily: '"Outfit Variable", "Outfit", system-ui, -apple-system, sans-serif',
    importPath: "@fontsource-variable/outfit",
  },
  {
    name: "Geist",
    family: "Geist Sans",
    cssFamily: '"Geist Sans", system-ui, -apple-system, sans-serif',
    importPath: "@fontsource/geist-sans",
  },
];

export const FONT_STORAGE_KEY = "portfolio_font";

export function getDefaultFont(): FontOption {
  return FONTS[0];
}

export function getFontByName(name: string): FontOption {
  return FONTS.find((f) => f.name === name) ?? getDefaultFont();
}
