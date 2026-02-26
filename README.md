# NCF Coding Best Practices

**Les bonnes pratiques de dev, installables en une commande.**

```bash
npx create-ncf-aidd mon-projet
```

> Scaffolde un projet complet : stack, Shadcn/ui, DX tooling, configs AI, 18 modules de docs — tout preconfigure, zero friction.

---

## Quickstart

```bash
# Mode interactif — choisis ta stack, tes outils, tes docs
npx create-ncf-aidd mon-projet

# Preset fullstack — Next.js + Supabase + Shadcn + DX + tout
npx create-ncf-aidd mon-projet --preset fullstack-next

# Absolument tout, zero question
npx create-ncf-aidd mon-projet --all
```

### Presets

| Commande | Stack | Ce que tu obtiens |
|---|---|---|
| `--preset fullstack-next` | Next.js + Supabase | Scaffold + Shadcn + DX + toutes docs |
| `--preset fullstack-vite` | Vite + Supabase | Scaffold + Shadcn + DX + toutes docs |
| `--preset landing` | Astro | Scaffold + DX + docs essentielles |
| `--preset minimal` | Next.js | DX + 4 docs fondamentales |
| `--all` | Next.js + Supabase | Tout + tous les addons |

> [Documentation complete du CLI](cli/README.md)

---

## Ce qui est installe

### Scaffolding + UI

- **Scaffolder automatique** selon ta stack (create-next-app, create-vite, create-astro)
- **Shadcn/ui** avec 47 composants, zero interaction

### DX Tooling

- **Husky** + **lint-staged** (pre-commit : Prettier + ESLint)
- **Commitlint** (conventional commits)
- **Vitest** (pre-push : types + tests)
- Configs `.prettierrc`, `eslint.config.mjs`, `.vscode/settings.json` preconfigures

### Configs AI

7 outils supportes — chacun avec ses regles au bon endroit :

**Claude Code** (`CLAUDE.md` + skills + slash commands) | **Cursor** (`.cursor/rules/`) | **GitHub Copilot** (`.github/copilot-instructions.md`) | **Codex** (`AGENTS.md`) | **Kilo Code** | **Windsurf** | **Aider**

### 8 commandes d'analyse

`/dry` `/kiss` `/solid` `/yagni` `/securityfix` `/rapport-code` `/deep-dive` `/validate`

### Addons optionnels

Tailwind CSS | Zod | Zustand | Framer Motion | Resend | Vercel AI SDK | BMAD Method

---

## Documentation

### Fondamentaux

| Module | Contenu |
|---|---|
| [Principes](docs/principes.md) | DRY, KISS, SOLID, YAGNI, MoSCoW, BMAD, regle des 3/5 min |
| [Qualite code](docs/qualite-code.md) | Pyramide d'enforcement, ESLint, Prettier, Husky, CI |
| [TypeScript](docs/typescript-conventions.md) | 5 commandements TS, nommage, imports, satisfies vs as |
| [Git workflow](docs/git-workflow.md) | Conventional commits, branches, CI, PR max 400 lignes |
| [Configs partagees](docs/configs-partagees.md) | Strategie configs qualite, contenu exact des fichiers |

### Frontend

| Module | Contenu |
|---|---|
| [React & Next.js](docs/react-nextjs-patterns.md) | Server/Client Components, Suspense, RSC, composition |
| [State Management](docs/state-management.md) | Zustand, formulaires, remote state, local vs global |
| [CSS & Design Tokens](docs/css-design-tokens.md) | Tokens, flex layout, responsive mobile-first |
| [Performance](docs/performance.md) | Budgets, memoisation, images, dynamic imports, N+1 |

### Backend

| Module | Contenu |
|---|---|
| [API & Backend](docs/api-backend-patterns.md) | Template mutation, pagination, idempotence |
| [Contrats API](docs/contrats-api.md) | Schemas Zod partages, validation en couches |
| [Base de donnees](docs/base-de-donnees.md) | Normalisation, migrations, indexation, soft delete |
| [Gestion d'erreurs](docs/gestion-erreurs.md) | Erreurs structurees, try/catch+toast, error boundaries |
| [Securite](docs/securite.md) | Sessions, CSRF, cookies, RLS, rate limiting, CORS |

### Transversal

| Module | Contenu |
|---|---|
| [Accessibilite](docs/accessibilite.md) | 5 regles a11y, ARIA, formulaires, testing axe-core |
| [Observabilite](docs/observabilite.md) | Logger structure, correlation ID, error tracking |
| [Tests](docs/tests-strategie.md) | Pyramide des tests, priorisation, MSW, factories |
| [Anti-patterns](docs/anti-patterns-checklist.md) | 42 interdits absolus, checklist PR complete |

### Reference

| Module | Contenu |
|---|---|
| [Constitution V5](docs/CLEAN-CODE-CONSTITUTION-V5.md) | Document exhaustif (25 chapitres, 110 KB) |
| [Creation de Skills](docs/creation-skills.md) | Structure, frontmatter, 5 patterns, progressive disclosure |

---

## Commandes d'analyse

| Commande | Usage |
|---|---|
| [/dry](commands/dry.md) | Detecter les duplications |
| [/kiss](commands/kiss.md) | Simplifier le code |
| [/solid](commands/solid.md) | Analyse SOLID |
| [/yagni](commands/yagni.md) | Supprimer le superflu |
| [/securityfix](commands/securityfix.md) | Audit securite |
| [/rapport-code](commands/rapport-code.md) | Revue complete (10 sections) |
| [/deep-dive](commands/deep-dive.md) | Debug macro |
| [/validate](commands/validate.md) | Checklist finale |

---

## Skills Claude

| Skill | Usage |
|---|---|
| `/ncf-frontend` | Composant, page, UI, formulaire, style, state, hook, a11y |
| `/ncf-backend` | API, mutation, query, DB, migration, auth, securite |
| `/ncf-review` | Validation post-code, anti-patterns, checklist qualite |
| [Skill Max](skills/skill-max.md) | Bible complete de la creation de skills Claude |

---

## Contribuer

```bash
git clone https://github.com/PoulpYBifle/NCF-Coding-Best-Practices.git
cd NCF-Coding-Best-Practices/cli
npm install
npm run dev -- mon-projet
```

## License

MIT
