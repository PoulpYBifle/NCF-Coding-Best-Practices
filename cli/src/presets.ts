import { ALL_AI_TOOLS, ALL_COMMANDS, ALL_DOCS } from "./constants.js";
import type { Preset, PresetName } from "./types.js";

export const PRESETS: Record<PresetName, Preset> = {
  "fullstack-next": {
    name: "fullstack-next",
    label: "Fullstack Next.js + Supabase",
    frontend: "nextjs",
    backend: "supabase",
    aiTools: ["claude", "cursor"],
    commands: ALL_COMMANDS,
    docs: ALL_DOCS,
    includeConstitution: true,
    includeSkillsGuide: false,
  },
  "fullstack-vite": {
    name: "fullstack-vite",
    label: "Fullstack Vite + Supabase",
    frontend: "vite",
    backend: "supabase",
    aiTools: ["claude", "cursor"],
    commands: ALL_COMMANDS,
    docs: ALL_DOCS,
    includeConstitution: true,
    includeSkillsGuide: false,
  },
  landing: {
    name: "landing",
    label: "Landing page Astro",
    frontend: "astro",
    backend: "none",
    aiTools: ["claude"],
    commands: ["kiss", "yagni", "validate"],
    docs: [
      "principes",
      "qualite-code",
      "typescript-conventions",
      "css-design-tokens",
      "performance",
      "accessibilite",
      "git-workflow",
      "configs-partagees",
    ],
    includeConstitution: false,
    includeSkillsGuide: false,
  },
  minimal: {
    name: "minimal",
    label: "Minimal — principes seuls",
    frontend: "nextjs",
    backend: "none",
    aiTools: ["claude"],
    commands: ["validate"],
    docs: ["principes", "qualite-code", "typescript-conventions", "configs-partagees"],
    includeConstitution: false,
    includeSkillsGuide: false,
  },
  all: {
    name: "all",
    label: "Tout inclure",
    frontend: "nextjs",
    backend: "supabase",
    aiTools: ALL_AI_TOOLS,
    commands: ALL_COMMANDS,
    docs: ALL_DOCS,
    includeConstitution: true,
    includeSkillsGuide: true,
  },
};

export function getPreset(name: string): Preset | undefined {
  return PRESETS[name as PresetName];
}
