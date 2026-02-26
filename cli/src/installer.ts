import { copy, ensureDir, pathExists } from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";
import { AI_TOOL_FILES, AI_TOOL_LABELS, CLAUDE_SKILL_FILES, COMMAND_FILES, DOC_FILES } from "./constants.js";
import type { UserChoices } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplatesDir(): string {
  return path.resolve(__dirname, "..", "templates");
}

async function copyFile(
  templatesDir: string,
  targetDir: string,
  src: string,
  dest: string,
): Promise<boolean> {
  const srcPath = path.join(templatesDir, src);
  const destPath = path.join(targetDir, dest);

  if (!(await pathExists(srcPath))) {
    console.log(pc.yellow(`  ! Skip (introuvable): ${src}`));
    return false;
  }

  await ensureDir(path.dirname(destPath));
  await copy(srcPath, destPath, { overwrite: true });
  return true;
}

export async function install(choices: UserChoices): Promise<void> {
  const templatesDir = getTemplatesDir();
  const targetDir = path.resolve(choices.targetDir);
  let fileCount = 0;
  const hasClaude = choices.aiTools.includes("claude");

  console.log();
  console.log(pc.bold("Installation NCF-AIDD"));
  console.log(pc.dim(`Destination : ${targetDir}`));
  console.log();

  if (!(await pathExists(templatesDir))) {
    console.log(pc.red(`Erreur : dossier templates introuvable (${templatesDir})`));
    console.log(pc.dim("Lancez 'npm run sync-templates' pour synchroniser les templates."));
    process.exit(1);
  }

  if (!choices.force && (await pathExists(path.join(targetDir, ".ncf")))) {
    console.log(pc.yellow("Le dossier .ncf/ existe deja. Utilisez --force pour ecraser."));
    process.exit(1);
  }

  // ── 1. AI Tool configs (chaque outil a son emplacement impose) ──
  console.log(pc.cyan("AI Tools"));
  for (const tool of choices.aiTools) {
    const files = AI_TOOL_FILES[tool];
    for (const file of files) {
      const copied = await copyFile(templatesDir, targetDir, file.src, file.dest);
      if (copied) {
        console.log(pc.green(`  + ${file.dest}`));
        fileCount++;
      }
    }
  }

  // ── 2. Claude Code skills → .claude/skills/ ──
  if (hasClaude) {
    console.log(pc.cyan("Claude Skills"));
    for (const file of CLAUDE_SKILL_FILES) {
      const copied = await copyFile(templatesDir, targetDir, file.src, file.dest);
      if (copied) {
        console.log(pc.green(`  + ${file.dest}`));
        fileCount++;
      }
    }
  }

  // ── 3. Commandes ──
  // Claude Code selectionne → .claude/commands/ (slash commands)
  // Pas Claude → .ncf/commands/ (reference)
  console.log(pc.cyan(hasClaude ? "Claude Commands (slash commands)" : "Commandes (reference)"));
  for (const cmd of choices.commands) {
    const src = COMMAND_FILES[cmd];
    const dest = hasClaude ? `.claude/${src}` : `.ncf/${src}`;
    const copied = await copyFile(templatesDir, targetDir, src, dest);
    if (copied) {
      console.log(pc.green(`  + ${dest}`));
      fileCount++;
    }
  }

  // ── 4. Documentation → .ncf/docs/ ──
  console.log(pc.cyan("Documentation"));
  for (const doc of choices.docs) {
    const src = DOC_FILES[doc];
    const dest = `.ncf/${src}`;
    const copied = await copyFile(templatesDir, targetDir, src, dest);
    if (copied) {
      console.log(pc.green(`  + ${dest}`));
      fileCount++;
    }
  }

  // ── 5. Constitution V5 ──
  if (choices.includeConstitution) {
    const copied = await copyFile(
      templatesDir,
      targetDir,
      "docs/CLEAN-CODE-CONSTITUTION-V5.md",
      ".ncf/docs/CLEAN-CODE-CONSTITUTION-V5.md",
    );
    if (copied) {
      console.log(pc.green("  + .ncf/docs/CLEAN-CODE-CONSTITUTION-V5.md"));
      fileCount++;
    }
  }

  // ── 6. Guide Skills ──
  if (choices.includeSkillsGuide) {
    console.log(pc.cyan("Guide Skills"));
    const files = [
      { src: "skills/skill-max.md", dest: ".ncf/skills/skill-max.md" },
      { src: "docs/creation-skills.md", dest: ".ncf/docs/creation-skills.md" },
    ];
    for (const file of files) {
      const copied = await copyFile(templatesDir, targetDir, file.src, file.dest);
      if (copied) {
        console.log(pc.green(`  + ${file.dest}`));
        fileCount++;
      }
    }
  }

  // ── Resume ──
  console.log();
  console.log(pc.green(pc.bold(`Done! ${fileCount} fichiers copies.`)));
  console.log();
  console.log(pc.bold("Prochaines etapes :"));
  console.log(`  1. ${pc.dim("Lisez")} .ncf/docs/principes.md ${pc.dim("pour le socle de regles")}`);

  const configuredTools = choices.aiTools
    .filter((t) => AI_TOOL_FILES[t].length > 0)
    .map((t) => AI_TOOL_LABELS[t]);

  if (configuredTools.length > 0) {
    console.log(`  2. ${pc.dim("Outils AI configures :")} ${configuredTools.join(", ")}`);
  }

  if (hasClaude) {
    console.log(`  3. ${pc.dim("Slash commands Claude :")} ${choices.commands.map((c) => `/${c}`).join(", ")}`);
    console.log(`  4. ${pc.dim("Skills Claude :")} /ncf-frontend, /ncf-backend, /ncf-review`);
  } else if (choices.commands.length > 0) {
    console.log(`  3. ${pc.dim("Commandes disponibles dans")} .ncf/commands/`);
  }

  console.log();
  console.log(pc.dim("Astuce : ajoutez .ncf/ a votre documentation interne"));
  console.log();
}
