# NCF Coding Best Practices

Depot des bonnes pratiques de developpement pour NCF.

## Documentation

### Fondamentaux

| Fichier | Contenu |
|---|---|
| [Principes](docs/principes.md) | DRY, KISS, SOLID, YAGNI, MoSCoW, BMAD, regle des 3/5 min |
| [Stack technique](docs/stack.md) | Next.js, Shadcn, Tailwind, Zod, Zustand, Astro |
| [Conventions TypeScript](docs/typescript-conventions.md) | 5 commandements TS, nommage, imports, satisfies vs as |

### Architecture & Patterns

| Fichier | Contenu |
|---|---|
| [React & Next.js](docs/react-nextjs-patterns.md) | Server/Client Components, Suspense, RSC, composition |
| [State Management](docs/state-management.md) | Zustand, formulaires, remote state, local vs global |
| [API & Backend](docs/api-backend-patterns.md) | Template mutation, pagination, idempotence, optimistic locking |
| [Contrats API](docs/contrats-api.md) | Schemas Zod partages, validation en couches, contract tests |
| [Gestion d'erreurs](docs/gestion-erreurs.md) | Erreurs structurees, try/catch+toast, error boundaries |

### Qualite & Securite

| Fichier | Contenu |
|---|---|
| [Securite](docs/securite.md) | Sessions, CSRF, cookies, RLS, rate limiting, CORS, upload |
| [Qualite du code](docs/qualite-code.md) | Pyramide d'enforcement, ESLint, Prettier, Husky, CI |
| [Tests](docs/tests-strategie.md) | Pyramide des tests, priorisation, MSW, factories, couverture |
| [Performance](docs/performance.md) | Budgets, memoisation, images, dynamic imports, N+1 |
| [Accessibilite](docs/accessibilite.md) | 5 regles a11y, ARIA, formulaires, testing axe-core |
| [Observabilite](docs/observabilite.md) | Logger structure, correlation ID, error tracking, RED |

### Base de donnees & Infra

| Fichier | Contenu |
|---|---|
| [Base de donnees](docs/base-de-donnees.md) | Normalisation, migrations, indexation, soft delete, dates |
| [CSS & Design Tokens](docs/css-design-tokens.md) | Tokens, flex layout, responsive mobile-first |
| [Git & GitHub](docs/git-workflow.md) | Conventional commits, branches, CI, PR max 400 lignes |

### Outils & Templates

| Fichier | Contenu |
|---|---|
| [Outils Claude](docs/outils-claude.md) | MCP, Skills, CLAUDE.md, configs |
| [Creation de Skills](docs/creation-skills.md) | Structure, frontmatter, 5 patterns, progressive disclosure |
| [Structure des templates](docs/template-structure.md) | Architecture du CLI et des templates de projet |

### Reference

| Fichier | Contenu |
|---|---|
| [Anti-patterns & Checklist PR](docs/anti-patterns-checklist.md) | 42 interdits absolus, checklist PR complete |
| [Clean Code Constitution V5](docs/CLEAN-CODE-CONSTITUTION-V5.md) | Document de reference exhaustif (25 chapitres) |

## Commands (analyse de code)

| Commande | Usage |
|---|---|
| [DRY](commands/dry.md) | Analyse DRY d'un code |
| [KISS](commands/kiss.md) | Analyse KISS d'un code |
| [SOLID](commands/solid.md) | Analyse SOLID d'un code |
| [YAGNI](commands/yagni.md) | Analyse YAGNI d'un code |
| [Rapport code](commands/rapport-code.md) | Revue complete (10 sections) |
| [Security fix](commands/securityfix.md) | Audit securite |
| [Deep dive](commands/deep-dive.md) | Resolution de probleme macro |

## Skills (reference)

| Fichier | Usage |
|---|---|
| [Skill Max](skills/skill-max.md) | Bible complete de la creation de skills Claude |
