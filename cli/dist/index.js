#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { install } from "./installer.js";
import { getPreset } from "./presets.js";
import { runPrompts } from "./prompts.js";
import { ALL_AI_TOOLS, ALL_COMMANDS, ALL_DOCS, } from "./constants.js";
const program = new Command();
program
    .name("create-ncf-aidd")
    .description("Scaffolde un projet avec les bonnes pratiques NCF AI-Driven Dev")
    .version("1.0.0")
    .argument("[directory]", "Dossier cible", ".")
    .option("--preset <name>", "Utiliser un preset (fullstack-next, fullstack-vite, landing, minimal, all)")
    .option("--all", "Tout inclure sans questions")
    .option("--force", "Ecraser les fichiers existants")
    .option("--yes", "Mode non-interactif (utilise les defauts)")
    .action(async (directory, options) => {
    const targetDir = directory;
    const force = options.force ?? false;
    let choices;
    // Mode preset
    if (options.preset) {
        const preset = getPreset(options.preset);
        if (!preset) {
            console.log(pc.red(`Preset inconnu : ${options.preset}`));
            console.log(pc.dim("Presets disponibles : fullstack-next, fullstack-vite, landing, minimal, all"));
            process.exit(1);
        }
        console.log(pc.bold(`Utilisation du preset : ${preset.label}`));
        choices = {
            targetDir,
            projectType: "perso",
            frontend: preset.frontend,
            backend: preset.backend,
            aiTools: preset.aiTools,
            commands: preset.commands,
            docs: preset.docs,
            includeConstitution: preset.includeConstitution,
            includeSkillsGuide: preset.includeSkillsGuide,
            force,
        };
    }
    // Mode --all
    else if (options.all) {
        console.log(pc.bold("Installation complete — tout inclus"));
        choices = {
            targetDir,
            projectType: "perso",
            frontend: "nextjs",
            backend: "supabase",
            aiTools: ALL_AI_TOOLS,
            commands: ALL_COMMANDS,
            docs: ALL_DOCS,
            includeConstitution: true,
            includeSkillsGuide: true,
            force,
        };
    }
    // Mode --yes (defauts)
    else if (options.yes) {
        console.log(pc.bold("Mode non-interactif — utilisation des defauts"));
        choices = {
            targetDir,
            projectType: "perso",
            frontend: "nextjs",
            backend: "supabase",
            aiTools: ["claude", "cursor"],
            commands: ALL_COMMANDS,
            docs: ALL_DOCS,
            includeConstitution: true,
            includeSkillsGuide: false,
            force,
        };
    }
    // Mode interactif
    else {
        choices = await runPrompts(targetDir, force);
    }
    await install(choices);
});
program.parse();
//# sourceMappingURL=index.js.map