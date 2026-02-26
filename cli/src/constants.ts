import type { AiTool, Command, DocModule, OptionalPackage, ScaffoldConfig } from "./types.js";

/**
 * Mapping AI tool → fichiers a copier.
 * src = relatif a templates/
 * dest = relatif au projet cible
 *
 * Chaque outil a son emplacement impose :
 * - Claude Code  : CLAUDE.md (racine) + .claude/skills/ + .claude/commands/
 * - Cursor       : .cursor/rules/*.mdc
 * - Copilot      : .github/copilot-instructions.md
 * - Codex        : AGENTS.md (racine)
 * - Kilo Code    : .kilocode/rules.md
 * - Windsurf     : .windsurfrules (racine)
 * - Aider        : .aider.conf.yml (racine)
 */
export const AI_TOOL_FILES: Record<AiTool, { src: string; dest: string }[]> = {
  claude: [{ src: "ai/CLAUDE.md", dest: "CLAUDE.md" }],
  cursor: [{ src: "ai/cursor/rules/project.mdc", dest: ".cursor/rules/project.mdc" }],
  copilot: [
    { src: "ai/copilot/copilot-instructions.md", dest: ".github/copilot-instructions.md" },
  ],
  codex: [{ src: "ai/AGENTS.md", dest: "AGENTS.md" }],
  kilocode: [{ src: "ai/kilocode/rules.md", dest: ".kilocode/rules.md" }],
  windsurf: [{ src: "ai/windsurfrules", dest: ".windsurfrules" }],
  aider: [{ src: "ai/aider.conf.yml", dest: ".aider.conf.yml" }],
};

/**
 * Skills Claude Code — vont dans .claude/skills/
 * Uniquement copies si Claude Code est selectionne.
 */
export const CLAUDE_SKILL_FILES = [
  { src: "skills/ncf-frontend/SKILL.md", dest: ".claude/skills/ncf-frontend/SKILL.md" },
  { src: "skills/ncf-backend/SKILL.md", dest: ".claude/skills/ncf-backend/SKILL.md" },
  { src: "skills/ncf-review/SKILL.md", dest: ".claude/skills/ncf-review/SKILL.md" },
];

/** Labels affichage pour les AI tools */
export const AI_TOOL_LABELS: Record<AiTool, string> = {
  claude: "Claude Code",
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  codex: "Codex (OpenAI)",
  kilocode: "Kilo Code",
  windsurf: "Windsurf (Codeium)",
  aider: "Aider",
};

/** Mapping commande → fichier source (dans templates/) */
export const COMMAND_FILES: Record<Command, string> = {
  dry: "commands/dry.md",
  kiss: "commands/kiss.md",
  solid: "commands/solid.md",
  yagni: "commands/yagni.md",
  securityfix: "commands/securityfix.md",
  "rapport-code": "commands/rapport-code.md",
  "deep-dive": "commands/deep-dive.md",
  validate: "commands/validate.md",
};

/** Labels affichage pour les commandes */
export const COMMAND_LABELS: Record<Command, string> = {
  dry: "DRY — Detecter les duplications",
  kiss: "KISS — Simplifier le code",
  solid: "SOLID — Principes SOLID",
  yagni: "YAGNI — Supprimer le superflu",
  securityfix: "Security Audit — Scan securite",
  "rapport-code": "Rapport complet — Analyse globale",
  "deep-dive": "Deep Dive — Debug macro",
  validate: "Validate — Checklist finale",
};

/** Mapping doc → fichier source */
export const DOC_FILES: Record<DocModule, string> = {
  principes: "docs/principes.md",
  "qualite-code": "docs/qualite-code.md",
  "tests-strategie": "docs/tests-strategie.md",
  "git-workflow": "docs/git-workflow.md",
  performance: "docs/performance.md",
  accessibilite: "docs/accessibilite.md",
  observabilite: "docs/observabilite.md",
  "anti-patterns-checklist": "docs/anti-patterns-checklist.md",
  "react-nextjs-patterns": "docs/react-nextjs-patterns.md",
  "state-management": "docs/state-management.md",
  "typescript-conventions": "docs/typescript-conventions.md",
  "css-design-tokens": "docs/css-design-tokens.md",
  securite: "docs/securite.md",
  "base-de-donnees": "docs/base-de-donnees.md",
  "api-backend-patterns": "docs/api-backend-patterns.md",
  "contrats-api": "docs/contrats-api.md",
  "gestion-erreurs": "docs/gestion-erreurs.md",
  "configs-partagees": "docs/configs-partagees.md",
};

/** Labels affichage pour les docs */
export const DOC_LABELS: Record<DocModule, string> = {
  principes: "Principes fondamentaux",
  "qualite-code": "Qualite code & linting",
  "tests-strategie": "Strategie de tests",
  "git-workflow": "Git workflow",
  performance: "Performance",
  accessibilite: "Accessibilite",
  observabilite: "Observabilite & logs",
  "anti-patterns-checklist": "Anti-patterns checklist",
  "react-nextjs-patterns": "React & Next.js patterns",
  "state-management": "State management",
  "typescript-conventions": "TypeScript conventions",
  "css-design-tokens": "CSS & design tokens",
  securite: "Securite",
  "base-de-donnees": "Base de donnees",
  "api-backend-patterns": "API & backend patterns",
  "contrats-api": "Contrats API",
  "gestion-erreurs": "Gestion des erreurs",
  "configs-partagees": "Configs qualite partagees",
};

/** Docs liees au frontend stack */
export const FRONTEND_DOCS: Record<string, DocModule[]> = {
  nextjs: ["react-nextjs-patterns", "state-management", "css-design-tokens", "performance"],
  vite: ["react-nextjs-patterns", "state-management", "css-design-tokens", "performance"],
  astro: ["css-design-tokens", "performance"],
};

/** Docs liees au backend */
export const BACKEND_DOCS: Record<string, DocModule[]> = {
  supabase: [
    "securite",
    "base-de-donnees",
    "api-backend-patterns",
    "contrats-api",
    "gestion-erreurs",
  ],
  convex: ["api-backend-patterns", "contrats-api", "gestion-erreurs"],
  sqlite: ["base-de-donnees", "api-backend-patterns", "contrats-api", "gestion-erreurs"],
  none: [],
};

/** Docs toujours incluses */
export const CORE_DOCS: DocModule[] = [
  "principes",
  "qualite-code",
  "typescript-conventions",
  "git-workflow",
  "configs-partagees",
];

/** Toutes les commandes */
export const ALL_COMMANDS: Command[] = [
  "dry",
  "kiss",
  "solid",
  "yagni",
  "securityfix",
  "rapport-code",
  "deep-dive",
  "validate",
];

/** Toutes les docs */
export const ALL_DOCS: DocModule[] = Object.keys(DOC_FILES) as DocModule[];

/** Tous les AI tools */
export const ALL_AI_TOOLS: AiTool[] = [
  "claude",
  "cursor",
  "copilot",
  "codex",
  "kilocode",
  "windsurf",
  "aider",
];

// ── Scaffolding ──

/** Commandes de scaffolding selon frontend + backend */
export const SCAFFOLD_COMMANDS: Record<string, ScaffoldConfig> = {
  "nextjs:supabase": {
    command: "npx create-next-app -e with-supabase",
    label: "Next.js + Supabase (template officiel)",
  },
  "nextjs:convex": {
    command: "npx create-next-app",
    label: "Next.js",
  },
  "nextjs:sqlite": {
    command: "npx create-next-app",
    label: "Next.js",
  },
  "nextjs:none": {
    command: "npx create-next-app",
    label: "Next.js",
  },
  "vite:supabase": {
    command: "npm create vite@latest",
    label: "Vite (React + TypeScript)",
  },
  "vite:convex": {
    command: "npm create vite@latest",
    label: "Vite (React + TypeScript)",
  },
  "vite:sqlite": {
    command: "npm create vite@latest",
    label: "Vite (React + TypeScript)",
  },
  "vite:none": {
    command: "npm create vite@latest",
    label: "Vite (React + TypeScript)",
  },
  "astro:supabase": {
    command: "npm create astro@latest",
    label: "Astro",
  },
  "astro:convex": {
    command: "npm create astro@latest",
    label: "Astro",
  },
  "astro:sqlite": {
    command: "npm create astro@latest",
    label: "Astro",
  },
  "astro:none": {
    command: "npm create astro@latest",
    label: "Astro",
  },
};

// ── DX Tooling ──

/** Packages DX a installer en devDependencies */
export const DX_PACKAGES = [
  "eslint",
  "eslint-config-next",
  "eslint-config-prettier",
  "prettier",
  "prettier-plugin-tailwindcss",
  "husky",
  "lint-staged",
  "@commitlint/cli",
  "@commitlint/config-conventional",
  "vitest",
  "@testing-library/react",
];

/** Fichiers de config DX a copier (src dans templates/, dest dans projet) */
export const DX_CONFIG_FILES = [
  { src: "configs/.prettierrc", dest: ".prettierrc" },
  { src: "configs/eslint.config.mjs", dest: "eslint.config.mjs" },
  { src: "configs/commitlint.config.mjs", dest: "commitlint.config.mjs" },
  { src: "configs/lint-staged.config.mjs", dest: "lint-staged.config.mjs" },
  { src: "configs/.vscode/settings.json", dest: ".vscode/settings.json" },
];

// ── Packages optionnels ──

export const OPTIONAL_PACKAGE_LABELS: Record<OptionalPackage, string> = {
  bmad: "BMAD Method (methode de prompting structuree)",
};

export const OPTIONAL_PACKAGE_COMMANDS: Record<OptionalPackage, string> = {
  bmad: "npx bmad-method install",
};

export const ALL_OPTIONAL_PACKAGES: OptionalPackage[] = ["bmad"];
