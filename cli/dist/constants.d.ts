import type { AiTool, Command, DocModule } from "./types.js";
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
export declare const AI_TOOL_FILES: Record<AiTool, {
    src: string;
    dest: string;
}[]>;
/**
 * Skills Claude Code — vont dans .claude/skills/
 * Uniquement copies si Claude Code est selectionne.
 */
export declare const CLAUDE_SKILL_FILES: {
    src: string;
    dest: string;
}[];
/** Labels affichage pour les AI tools */
export declare const AI_TOOL_LABELS: Record<AiTool, string>;
/** Mapping commande → fichier source (dans templates/) */
export declare const COMMAND_FILES: Record<Command, string>;
/** Labels affichage pour les commandes */
export declare const COMMAND_LABELS: Record<Command, string>;
/** Mapping doc → fichier source */
export declare const DOC_FILES: Record<DocModule, string>;
/** Labels affichage pour les docs */
export declare const DOC_LABELS: Record<DocModule, string>;
/** Docs liees au frontend stack */
export declare const FRONTEND_DOCS: Record<string, DocModule[]>;
/** Docs liees au backend */
export declare const BACKEND_DOCS: Record<string, DocModule[]>;
/** Docs toujours incluses */
export declare const CORE_DOCS: DocModule[];
/** Toutes les commandes */
export declare const ALL_COMMANDS: Command[];
/** Toutes les docs */
export declare const ALL_DOCS: DocModule[];
/** Tous les AI tools */
export declare const ALL_AI_TOOLS: AiTool[];
