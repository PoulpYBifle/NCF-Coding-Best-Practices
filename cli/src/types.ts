export type ProjectType = "perso" | "client";

export type FrontendStack = "nextjs" | "vite" | "astro";

export type Backend = "supabase" | "convex" | "sqlite" | "none";

export type AiTool =
  | "claude"
  | "cursor"
  | "copilot"
  | "codex"
  | "kilocode"
  | "windsurf"
  | "aider";

export type Command =
  | "dry"
  | "kiss"
  | "solid"
  | "yagni"
  | "securityfix"
  | "rapport-code"
  | "deep-dive"
  | "validate";

export type DocModule =
  | "principes"
  | "qualite-code"
  | "tests-strategie"
  | "git-workflow"
  | "performance"
  | "accessibilite"
  | "observabilite"
  | "anti-patterns-checklist"
  | "react-nextjs-patterns"
  | "state-management"
  | "typescript-conventions"
  | "css-design-tokens"
  | "securite"
  | "base-de-donnees"
  | "api-backend-patterns"
  | "contrats-api"
  | "gestion-erreurs"
  | "configs-partagees";

export type OptionalPackage =
  | "tailwind"
  | "zod"
  | "zustand"
  | "framer-motion"
  | "resend"
  | "vercel-ai"
  | "bmad";

export interface OptionalPackageConfig {
  label: string;
  hint?: string;
  npmPackages?: string[];
  npxCommand?: string;
}

export type PresetName =
  | "fullstack-next"
  | "fullstack-vite"
  | "landing"
  | "minimal"
  | "all";

export interface ScaffoldConfig {
  command: string;
  label: string;
}

export interface UserChoices {
  targetDir: string;
  projectType: ProjectType;
  frontend: FrontendStack;
  backend: Backend;
  aiTools: AiTool[];
  commands: Command[];
  docs: DocModule[];
  includeConstitution: boolean;
  includeSkillsGuide: boolean;
  scaffoldProject: boolean;
  includeShadcn: boolean;
  dxTooling: boolean;
  packages: OptionalPackage[];
  force: boolean;
}

export interface Preset {
  name: PresetName;
  label: string;
  frontend: FrontendStack;
  backend: Backend;
  aiTools: AiTool[];
  commands: Command[];
  docs: DocModule[];
  includeConstitution: boolean;
  includeSkillsGuide: boolean;
  scaffoldProject: boolean;
  includeShadcn: boolean;
  dxTooling: boolean;
  packages: OptionalPackage[];
}
