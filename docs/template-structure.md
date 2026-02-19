# Structure du CLI & des Templates

## Concept général

Un CLI interactif (`create-ncf-app`) qui compose un projet à partir de blocs :
- une **base commune** à tous les projets
- un **framework** choisi par l'utilisateur
- des **addons** optionnels sélectionnés via le CLI

---

## Arborescence complète

```
templates/
│
├── _base/                          # Configs partagées par TOUS les projets
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── .gitignore
│   ├── .husky/
│   │   ├── pre-commit              # prettier + eslint
│   │   └── pre-push               # vitest
│   ├── src/
│   │   └── styles/
│   │       └── globals.css        # Design tokens + variables CSS Shadcn
│   └── components.json            # Config Shadcn (base)
│
├── nextjs/                         # Template Next.js 16
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts         # content paths spécifiques Next.js
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components/ui/         # Shadcn components
│       ├── lib/utils.ts
│       └── stores/                # Zustand stores
│
├── astro/                          # Template Astro (landing / SEO)
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts         # content paths spécifiques Astro
│   └── src/
│       ├── layouts/
│       ├── pages/
│       └── components/
│
└── addons/                         # Modules optionnels — mergés par le CLI
    ├── supabase/
    │   ├── src/lib/supabase.ts
    │   ├── src/middleware.ts
    │   └── .env.example
    ├── supabase-auth/
    │   └── src/app/(auth)/
    ├── resend/
    │   └── src/lib/email.ts
    │
    └── ai-tools/                   # Config selon l'outil de coding AI choisi
        ├── claude/
        │   ├── CLAUDE.md
        │   └── .claude/
        │       └── settings.json
        ├── cursor/
        │   └── .cursor/
        │       └── rules/
        │           └── project.mdc
        ├── kilocode/
        │   └── .kilocode/
        │       └── rules.md
        ├── opencode/
        │   └── opencode.json
        ├── copilot/
        │   └── .github/
        │       └── copilot-instructions.md
        └── codex/
            └── AGENTS.md
```

---

## Logique de composition du CLI

```
_base  +  [nextjs | astro]  +  [supabase?]  +  [supabase-auth?]  +  [resend?]  +  [ai-tool?]
```

Le CLI copie les fichiers dans l'ordre et **merge les `package.json`** (les dépendances des addons s'ajoutent à celles du framework). C'est la seule logique non-triviale à écrire.

---

## Questions posées par le CLI

```
? Quel type de projet ?       → Next.js / Astro
? Backend / BDD ?             → Supabase / Aucun
? Avec Auth ?                 → Oui / Non       (si Supabase = Oui)
? Emails transactionnels ?    → Resend / Non
? Outil de coding AI ?        → Claude Code / Cursor / Kilo Code /
                                 OpenCode / GitHub Copilot / Codex / Aucun
? Nom du projet ?             → mon-projet
```

---

## Configs AI tools — fichiers attendus par outil

| Outil | Fichier de config |
|---|---|
| Claude Code | `CLAUDE.md` + `.claude/settings.json` |
| Cursor | `.cursor/rules/*.mdc` |
| Kilo Code | `.kilocode/rules.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex (OpenAI) | `AGENTS.md` |
| OpenCode | `opencode.json` |

Le contenu de chaque fichier est identique dans le fond (règles du projet : DRY, KISS, stack, sécurité) — seul le format diffère selon l'outil.

---

## Pourquoi pas de branches par template ?

Les branches templates divergent rapidement et deviennent un enfer à maintenir. Tout est dans `main`, organisé par dossiers. `degit` supporte les sous-dossiers donc ça reste clonable directement sans CLI.

---

## Ordre de construction recommandé

1. `_base/` — configs communes (ESLint, Prettier, Husky, globals.css, components.json)
2. `templates/nextjs/` — template Next.js sans addons
3. CLI minimal (compose _base + nextjs, pose les questions, lance bun install)
4. `templates/astro/`
5. `addons/supabase/` + `addons/supabase-auth/`
6. `addons/ai-tools/` (un dossier par outil)
7. `addons/resend/`
