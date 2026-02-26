/**
 * Synchronise les fichiers du repo root vers cli/templates/
 * Usage : npm run sync-templates (depuis cli/)
 */

import { copy, ensureDir, pathExists } from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..", "..");
const templatesDir = path.resolve(__dirname, "..", "templates");

interface SyncItem {
  src: string;
  dest: string;
}

const SYNC_MAP: SyncItem[] = [
  // ── AI tool configs ──
  { src: "CLAUDE.md", dest: "ai/CLAUDE.md" },
  { src: "AGENTS.md", dest: "ai/AGENTS.md" },
  { src: ".cursor/rules/project.mdc", dest: "ai/cursor/rules/project.mdc" },
  { src: ".github/copilot-instructions.md", dest: "ai/copilot/copilot-instructions.md" },
  { src: ".kilocode/rules.md", dest: "ai/kilocode/rules.md" },
  { src: ".windsurfrules", dest: "ai/windsurfrules" },
  { src: ".aider.conf.yml", dest: "ai/aider.conf.yml" },

  // ── Skills (Claude Code) ──
  { src: "skills/ncf-frontend/SKILL.md", dest: "skills/ncf-frontend/SKILL.md" },
  { src: "skills/ncf-backend/SKILL.md", dest: "skills/ncf-backend/SKILL.md" },
  { src: "skills/ncf-review/SKILL.md", dest: "skills/ncf-review/SKILL.md" },
  { src: "skills/skill-max.md", dest: "skills/skill-max.md" },

  // ── Commands ──
  { src: "commands/dry.md", dest: "commands/dry.md" },
  { src: "commands/kiss.md", dest: "commands/kiss.md" },
  { src: "commands/solid.md", dest: "commands/solid.md" },
  { src: "commands/yagni.md", dest: "commands/yagni.md" },
  { src: "commands/securityfix.md", dest: "commands/securityfix.md" },
  { src: "commands/rapport-code.md", dest: "commands/rapport-code.md" },
  { src: "commands/deep-dive.md", dest: "commands/deep-dive.md" },
  { src: "commands/validate.md", dest: "commands/validate.md" },

  // ── Docs ──
  { src: "docs/principes.md", dest: "docs/principes.md" },
  { src: "docs/qualite-code.md", dest: "docs/qualite-code.md" },
  { src: "docs/tests-strategie.md", dest: "docs/tests-strategie.md" },
  { src: "docs/git-workflow.md", dest: "docs/git-workflow.md" },
  { src: "docs/performance.md", dest: "docs/performance.md" },
  { src: "docs/accessibilite.md", dest: "docs/accessibilite.md" },
  { src: "docs/observabilite.md", dest: "docs/observabilite.md" },
  { src: "docs/anti-patterns-checklist.md", dest: "docs/anti-patterns-checklist.md" },
  { src: "docs/react-nextjs-patterns.md", dest: "docs/react-nextjs-patterns.md" },
  { src: "docs/state-management.md", dest: "docs/state-management.md" },
  { src: "docs/typescript-conventions.md", dest: "docs/typescript-conventions.md" },
  { src: "docs/css-design-tokens.md", dest: "docs/css-design-tokens.md" },
  { src: "docs/securite.md", dest: "docs/securite.md" },
  { src: "docs/base-de-donnees.md", dest: "docs/base-de-donnees.md" },
  { src: "docs/api-backend-patterns.md", dest: "docs/api-backend-patterns.md" },
  { src: "docs/contrats-api.md", dest: "docs/contrats-api.md" },
  { src: "docs/gestion-erreurs.md", dest: "docs/gestion-erreurs.md" },
  { src: "docs/configs-partagees.md", dest: "docs/configs-partagees.md" },
  { src: "docs/creation-skills.md", dest: "docs/creation-skills.md" },
  { src: "docs/CLEAN-CODE-CONSTITUTION-V5.md", dest: "docs/CLEAN-CODE-CONSTITUTION-V5.md" },
];

async function sync(): Promise<void> {
  console.log(pc.bold("Synchronisation des templates..."));
  console.log(pc.dim(`Repo root : ${repoRoot}`));
  console.log(pc.dim(`Templates : ${templatesDir}`));
  console.log();

  let synced = 0;
  let skipped = 0;

  for (const item of SYNC_MAP) {
    const srcPath = path.join(repoRoot, item.src);
    const destPath = path.join(templatesDir, item.dest);

    if (!(await pathExists(srcPath))) {
      console.log(pc.yellow(`  ! Skip: ${item.src} (not found)`));
      skipped++;
      continue;
    }

    await ensureDir(path.dirname(destPath));
    await copy(srcPath, destPath, { overwrite: true });
    console.log(pc.green(`  + ${item.dest}`));
    synced++;
  }

  console.log();
  console.log(pc.green(pc.bold(`Synced: ${synced} fichiers`)));
  if (skipped > 0) {
    console.log(pc.yellow(`Skipped: ${skipped} fichiers`));
  }
}

sync().catch((err) => {
  console.error(pc.red("Erreur de synchronisation:"), err);
  process.exit(1);
});
