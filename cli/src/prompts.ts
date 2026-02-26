import * as p from "@clack/prompts";
import {
  AI_TOOL_LABELS,
  ALL_AI_TOOLS,
  ALL_COMMANDS,
  ALL_DOCS,
  ALL_OPTIONAL_PACKAGES,
  BACKEND_DOCS,
  COMMAND_LABELS,
  CORE_DOCS,
  DOC_LABELS,
  FRONTEND_DOCS,
  OPTIONAL_PACKAGES_CONFIG,
  SCAFFOLD_COMMANDS,
} from "./constants.js";
import type {
  AiTool,
  Backend,
  Command,
  DocModule,
  FrontendStack,
  OptionalPackage,
  ProjectType,
  UserChoices,
} from "./types.js";

function handleCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel("Installation annulee.");
    process.exit(0);
  }
}

export async function runPrompts(targetDir: string, force: boolean): Promise<UserChoices> {
  p.intro("create-ncf-aidd — Setup des bonnes pratiques AI-Driven Dev");

  // 1. Type de projet
  const projectType = await p.select({
    message: "Type de projet ?",
    options: [
      { value: "perso", label: "Projet perso", hint: "config standard" },
      {
        value: "client",
        label: "Projet client",
        hint: "regles strictes (observabilite, logs, PR checklist)",
      },
    ],
  });
  handleCancel(projectType);

  // 2. Stack frontend
  const frontend = await p.select({
    message: "Stack frontend ?",
    options: [
      { value: "nextjs", label: "Next.js (App Router)", hint: "recommande" },
      { value: "vite", label: "Vite (React)" },
      { value: "astro", label: "Astro (landing / SEO)" },
    ],
  });
  handleCancel(frontend);

  // 3. Backend
  const backend = await p.select({
    message: "Backend ?",
    options: [
      { value: "supabase", label: "Supabase", hint: "recommande" },
      { value: "convex", label: "Convex" },
      { value: "sqlite", label: "SQLite" },
      { value: "none", label: "Aucun / Autre" },
    ],
  });
  handleCancel(backend);

  // 3b. Scaffolding projet
  const scaffoldKey = `${frontend as string}:${backend as string}`;
  const scaffoldConfig = SCAFFOLD_COMMANDS[scaffoldKey];
  let scaffoldProject = false;

  if (scaffoldConfig) {
    const scaffold = await p.confirm({
      message: `Scaffolder le projet avec ${scaffoldConfig.command} ?`,
      initialValue: true,
    });
    handleCancel(scaffold);
    scaffoldProject = scaffold as boolean;
  }

  // 3c. Shadcn/ui (composants UI)
  const shadcn = await p.confirm({
    message: "Installer Shadcn/ui avec tous les composants ? (47 composants, zero interaction)",
    initialValue: true,
  });
  handleCancel(shadcn);
  const includeShadcn = shadcn as boolean;

  // 4. Outils AI (multiselect)
  const aiTools = await p.multiselect({
    message: "Outils AI a configurer ?",
    options: ALL_AI_TOOLS.map((tool) => ({
      value: tool,
      label: AI_TOOL_LABELS[tool],
      hint: tool === "claude" ? "recommande" : undefined,
    })),
    initialValues: ["claude"] as AiTool[],
    required: true,
  });
  handleCancel(aiTools);

  const hasClaude = (aiTools as AiTool[]).includes("claude");

  // 5. Commandes d'analyse
  // Les commandes deviennent des slash commands Claude (/dry, /kiss...)
  // ou des references docs si pas Claude
  const commandHint = hasClaude
    ? "Installees comme slash commands Claude (/dry, /kiss...)"
    : "Installees comme references dans .ncf/commands/";

  const commandsAll = await p.confirm({
    message: `Installer toutes les commandes d'analyse ? ${commandHint}`,
    initialValue: true,
  });
  handleCancel(commandsAll);

  let commands: Command[];
  if (commandsAll) {
    commands = ALL_COMMANDS;
  } else {
    const selectedCommands = await p.multiselect({
      message: "Quelles commandes ?",
      options: ALL_COMMANDS.map((cmd) => ({
        value: cmd,
        label: COMMAND_LABELS[cmd],
      })),
      required: true,
    });
    handleCancel(selectedCommands);
    commands = selectedCommands as Command[];
  }

  // 6. Modules docs
  const suggestedDocs = new Set<DocModule>([
    ...CORE_DOCS,
    ...(FRONTEND_DOCS[frontend as string] ?? []),
    ...(BACKEND_DOCS[backend as string] ?? []),
  ]);

  const docsAll = await p.confirm({
    message: "Installer toutes les docs ? (principes, securite, tests, performance...)",
    initialValue: true,
  });
  handleCancel(docsAll);

  let docs: DocModule[];
  if (docsAll) {
    docs = ALL_DOCS;
  } else {
    const selectedDocs = await p.multiselect({
      message: "Quels modules docs ?",
      options: ALL_DOCS.map((doc) => ({
        value: doc,
        label: DOC_LABELS[doc],
        hint: suggestedDocs.has(doc) ? "recommande pour votre stack" : undefined,
      })),
      initialValues: [...suggestedDocs],
      required: true,
    });
    handleCancel(selectedDocs);
    docs = selectedDocs as DocModule[];
  }

  // 7. Constitution V5
  const includeConstitution = await p.confirm({
    message: "Inclure la Constitution Clean Code V5 ? (110 KB, reference exhaustive)",
    initialValue: true,
  });
  handleCancel(includeConstitution);

  // 8. Guide creation de skills (seulement si Claude Code selectionne)
  let includeSkillsGuide = false;
  if (hasClaude) {
    const skillsGuide = await p.confirm({
      message: "Inclure le guide de creation de skills Claude ?",
      initialValue: false,
    });
    handleCancel(skillsGuide);
    includeSkillsGuide = skillsGuide as boolean;
  }

  // 9. DX Tooling
  const dxTooling = await p.confirm({
    message: "Installer le DX Tooling ? (Husky, lint-staged, Prettier, ESLint, Commitlint, Vitest)",
    initialValue: true,
  });
  handleCancel(dxTooling);

  // 10. Packages optionnels (addons)
  let packages: OptionalPackage[] = [];
  if (ALL_OPTIONAL_PACKAGES.length > 0) {
    const selectedPackages = await p.multiselect({
      message: "Addons a installer ?",
      options: ALL_OPTIONAL_PACKAGES.map((pkg) => {
        const config = OPTIONAL_PACKAGES_CONFIG[pkg];
        return {
          value: pkg,
          label: config.label,
          hint: config.hint,
        };
      }),
      required: false,
    });
    handleCancel(selectedPackages);
    packages = selectedPackages as OptionalPackage[];
  }

  p.outro("Configuration terminee ! Installation en cours...");

  return {
    targetDir,
    projectType: projectType as ProjectType,
    frontend: frontend as FrontendStack,
    backend: backend as Backend,
    aiTools: aiTools as AiTool[],
    commands,
    docs,
    includeConstitution: includeConstitution as boolean,
    includeSkillsGuide,
    scaffoldProject,
    includeShadcn,
    dxTooling: dxTooling as boolean,
    packages,
    force,
  };
}
