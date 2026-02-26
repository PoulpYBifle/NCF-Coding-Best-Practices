# create-ncf-aidd

**Le CLI qui scaffolde un projet propre en 30 secondes.**

Setup complet : stack, UI, DX tooling, configs AI, docs de bonnes pratiques — tout preconfigure, zero friction.

```bash
npx create-ncf-aidd mon-projet
```

---

## Quickstart

### Une seule commande, projet pret

```bash
# Mode interactif — reponds aux questions, le CLI fait le reste
npx create-ncf-aidd mon-projet

# Mode preset — zero question
npx create-ncf-aidd mon-projet --preset fullstack-next

# Tout inclure — la totale
npx create-ncf-aidd mon-projet --all
```

### Ce que tu obtiens

```
mon-projet/
  CLAUDE.md                         # Config Claude Code
  .cursor/rules/project.mdc        # Config Cursor
  .github/copilot-instructions.md   # Config Copilot
  .claude/
    skills/                         # Skills Claude (/ncf-frontend, /ncf-backend, /ncf-review)
    commands/                       # Slash commands (/dry, /kiss, /solid, /validate...)
  .ncf/
    docs/                           # 18 modules de bonnes pratiques
    docs/CLEAN-CODE-CONSTITUTION-V5.md
  .husky/
    pre-commit                      # lint-staged (Prettier + ESLint)
    pre-push                        # tsc --noEmit + vitest run
  .prettierrc                       # Config Prettier NCF
  eslint.config.mjs                 # Config ESLint NCF
  commitlint.config.mjs             # Conventional commits
  lint-staged.config.mjs            # Format + lint sur fichiers stages
  .vscode/settings.json             # Format on save + ESLint auto-fix
  components/ui/                    # 47 composants Shadcn/ui
```

---

## Commandes

| Commande | Description |
|---|---|
| `npx create-ncf-aidd mon-projet` | Mode interactif |
| `npx create-ncf-aidd mon-projet --preset <nom>` | Utiliser un preset |
| `npx create-ncf-aidd mon-projet --all` | Tout inclure |
| `npx create-ncf-aidd mon-projet --yes` | Defauts sans questions |
| `npx create-ncf-aidd mon-projet --force` | Ecraser si .ncf/ existe deja |

### Presets disponibles

| Preset | Stack | Contenu |
|---|---|---|
| `fullstack-next` | Next.js + Supabase | Scaffold + Shadcn + DX + toutes docs + constitution |
| `fullstack-vite` | Vite + Supabase | Scaffold + Shadcn + DX + toutes docs + constitution |
| `landing` | Astro | Scaffold + DX + docs essentielles |
| `minimal` | Next.js | DX + 4 docs fondamentales |
| `all` | Next.js + Supabase | Absolument tout + tous les addons |

---

## Ce que le CLI installe

### 1. Scaffolding projet

Selon ta stack, le CLI lance le scaffolder officiel :

| Stack | Commande |
|---|---|
| Next.js + Supabase | `npx create-next-app -e with-supabase` |
| Next.js | `npx create-next-app` |
| Vite | `npm create vite@latest` |
| Astro | `npm create astro@latest` |

### 2. Shadcn/ui — 47 composants

Installation automatique, zero interaction :

```
Accordion   Alert         Alert Dialog   Avatar        Badge
Breadcrumb  Button        Calendar       Card          Carousel
Checkbox    Collapsible   Combobox       Command       Context Menu
Data Table  Date Picker   Dialog         Drawer        Dropdown Menu
Input       Input OTP     Label          Menubar       Navigation Menu
Pagination  Popover       Progress       Radio Group   Resizable
Scroll Area Select        Separator      Sheet         Sidebar
Skeleton    Slider        Sonner         Switch        Table
Tabs        Textarea      Toast          Toggle        Toggle Group
Tooltip
```

### 3. DX Tooling

Le setup qualite complet, preconfigure avec les regles NCF :

| Outil | Role |
|---|---|
| **Husky** | Git hooks automatiques |
| **lint-staged** | Prettier + ESLint sur fichiers stages (pre-commit) |
| **Commitlint** | Conventional commits obligatoires |
| **Prettier** | Formatage (semi, double quotes, printWidth 100, plugin Tailwind) |
| **ESLint** | Regles Next.js + TypeScript strict (no-any, exhaustive-deps) |
| **Vitest** | Tests unitaires (pre-push) |

**Hooks Git installes :**

- `pre-commit` : `npx lint-staged` (format + lint automatique)
- `pre-push` : `npx tsc --noEmit && npx vitest run` (types + tests)

### 4. Configs AI

Support multi-outils — chacun avec son fichier de regles au bon endroit :

| Outil | Fichier genere |
|---|---|
| Claude Code | `CLAUDE.md` + `.claude/skills/` + `.claude/commands/` |
| Cursor | `.cursor/rules/project.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex (OpenAI) | `AGENTS.md` |
| Kilo Code | `.kilocode/rules.md` |
| Windsurf | `.windsurfrules` |
| Aider | `.aider.conf.yml` |

### 5. Commandes d'analyse

8 commandes d'analyse de code, installees comme slash commands Claude (`/dry`, `/kiss`...) :

| Commande | Usage |
|---|---|
| `/dry` | Detecter les duplications |
| `/kiss` | Simplifier le code |
| `/solid` | Analyse SOLID |
| `/yagni` | Supprimer le superflu |
| `/securityfix` | Audit securite |
| `/rapport-code` | Revue complete (10 sections) |
| `/deep-dive` | Debug macro |
| `/validate` | Checklist finale |

### 6. Documentation

18 modules de bonnes pratiques couvrant toute la stack :

**Fondamentaux :** Principes, Qualite code, TypeScript, Git workflow, Configs partagees

**Frontend :** React & Next.js patterns, State management, CSS & design tokens, Performance

**Backend :** API & backend patterns, Contrats API, Base de donnees, Gestion d'erreurs, Securite

**Transversal :** Accessibilite, Observabilite, Tests, Anti-patterns checklist

+ **Constitution Clean Code V5** (document de reference exhaustif, 25 chapitres)

### 7. Addons optionnels

Packages supplementaires au choix :

| Addon | Package(s) installe(s) |
|---|---|
| **Tailwind CSS** | `tailwindcss` `@tailwindcss/postcss` |
| **Zod** | `zod` |
| **Zustand** | `zustand` |
| **Framer Motion** | `framer-motion` |
| **Resend** | `resend` |
| **Vercel AI SDK** | `ai` `@ai-sdk/openai` `@ai-sdk/anthropic` |
| **BMAD Method** | `npx bmad-method install` |

---

## Flow interactif

Quand tu lances `npx create-ncf-aidd`, le CLI te guide etape par etape :

```
  create-ncf-aidd — Setup des bonnes pratiques AI-Driven Dev

◆ Type de projet ?
│ ● Projet perso
│ ○ Projet client
│
◆ Stack frontend ?
│ ● Next.js (App Router)
│ ○ Vite (React)
│ ○ Astro (landing / SEO)
│
◆ Backend ?
│ ● Supabase
│ ○ Convex
│ ○ SQLite
│ ○ Aucun / Autre
│
◆ Scaffolder le projet avec npx create-next-app -e with-supabase ?
│ ● Oui / ○ Non
│
◆ Installer Shadcn/ui avec tous les composants ?
│ ● Oui / ○ Non
│
◆ Outils AI a configurer ?
│ ◼ Claude Code (recommande)
│ ◻ Cursor
│ ◻ GitHub Copilot
│ ◻ Codex (OpenAI)
│ ◻ Kilo Code
│ ◻ Windsurf
│ ◻ Aider
│
◆ Installer toutes les commandes d'analyse ?
│ ● Oui / ○ Non
│
◆ Installer toutes les docs ?
│ ● Oui / ○ Non
│
◆ Inclure la Constitution Clean Code V5 ?
│ ● Oui / ○ Non
│
◆ Installer le DX Tooling ?
│ ● Oui / ○ Non
│
◆ Addons a installer ?
│ ◻ Tailwind CSS
│ ◻ Zod (validation de schemas)
│ ◻ Zustand (state management)
│ ◻ Framer Motion (animations)
│ ◻ Resend (emails transactionnels)
│ ◻ Vercel AI SDK
│ ◻ BMAD Method
│
  Configuration terminee ! Installation en cours...
```

---

## Exemples

### Nouveau projet fullstack (la methode rapide)

```bash
npx create-ncf-aidd mon-saas --preset fullstack-next
```

Cree un projet Next.js + Supabase + Shadcn/ui + DX Tooling complet + toutes les docs.

### Ajouter NCF a un projet existant

```bash
cd mon-projet-existant
npx create-ncf-aidd . --force
```

Le `.` cible le dossier courant. `--force` ecrase les fichiers NCF existants.

### Landing page rapide

```bash
npx create-ncf-aidd ma-landing --preset landing
```

Astro + DX Tooling + docs essentielles. Pas de Shadcn ni de backend.

### CI / scripts automatises

```bash
npx create-ncf-aidd mon-projet --yes
```

Utilise les defauts (Next.js + Supabase + Claude + Cursor + toutes docs) sans aucune question.

---

## Stack supportee

- **Frontend** : Next.js (App Router), Vite (React), Astro
- **Backend** : Supabase, Convex, SQLite
- **UI** : Shadcn/ui (47 composants)
- **AI Tools** : Claude Code, Cursor, GitHub Copilot, Codex, Kilo Code, Windsurf, Aider
- **DX** : Husky, lint-staged, Prettier, ESLint, Commitlint, Vitest
- **Package managers** : bun (priorite) ou npm (auto-detecte)

---

## Contribuer

Le depot source est [NCF-Coding-Best-Practices](https://github.com/PoulpYBifle/NCF-Coding-Best-Practices).

```bash
git clone https://github.com/PoulpYBifle/NCF-Coding-Best-Practices.git
cd NCF-Coding-Best-Practices/cli
npm install
npm run dev -- mon-projet  # Lance le CLI en mode dev
```

### Structure du CLI

```
cli/
  src/
    index.ts        # Point d'entree (Commander.js)
    types.ts        # Types TypeScript
    constants.ts    # Mappings fichiers, packages, labels
    prompts.ts      # Flow interactif (@clack/prompts)
    presets.ts      # Presets preconfigures
    installer.ts    # Logique d'installation
  templates/        # Fichiers copies dans le projet cible
    ai/             # Configs AI (CLAUDE.md, .cursor/, etc.)
    commands/       # Commandes d'analyse (dry.md, kiss.md, etc.)
    configs/        # Configs DX (.prettierrc, eslint, etc.)
    docs/           # Modules de bonnes pratiques
    skills/         # Skills Claude
  scripts/
    sync-templates.ts  # Sync templates depuis la racine du repo
```

## License

MIT
