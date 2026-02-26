# TypeScript — Regles & Conventions

## 5 commandements

```
1. Zero `any`            → `unknown` + type guard si type inconnu
2. Zero `as` par defaut  → Exception avec `// EXCEPTION-TYPECAST: [raison]`
                           Preferer `satisfies` quand possible
3. Interfaces explicites → Toute props de composant a une interface nommee
4. Types generes         → Utiliser les types de l'ORM/backend, jamais redefinir
5. Union discriminee     → `never` obligatoire dans les switch exhaustifs
```

## `satisfies` vs `as const` vs `as`

| Outil | Usage | Effet |
|---|---|---|
| `satisfies T` | Verifier la compatibilite sans elargir le type | Type infere reste precis |
| `as const` | Figer en type literal (readonly) | Permet de deriver un union type |
| `as T` | Forcer un type (cast) | **Dangereux** — masque les erreurs |

## Imports

**Path aliases obligatoires.** Imports relatifs au-dela de 1 niveau interdits.

```json
// tsconfig.json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

**Ordre des imports** (6 groupes avec saut de ligne entre chaque) :

1. React / Next.js
2. Librairies tierces
3. Backend / API
4. Composants internes
5. Hooks, stores, utils
6. Types (`import type`)

**Barrel exports (`index.ts`) deconseilles** sauf `components/ui/` et `lib/hooks/`. Import direct du fichier source.

## Conventions de nommage

| Element | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `UserCard.tsx` |
| Fichier composant | PascalCase (= nom export) | `UserCard.tsx` |
| Hook custom | camelCase + prefix `use` | `use-focus-hover.ts` |
| Store Zustand | camelCase + prefix `use` | `use[Domain]Store` |
| Fichier utilitaire | kebab-case | `markdown-parser.ts` |
| Fonction | camelCase | `createUser()` |
| Constante | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Type / Interface | PascalCase | `UserProfile` |
| Props interface | PascalCase + `Props` | `UserCardProps` |
| Table DB (SQL) | snake_case | `user_profiles` |
| Table DB (NoSQL) | camelCase | `userProjects` |
| Variable CSS | kebab-case + `--` | `--color-primary` |
| Schema Zod | camelCase + Schema | `createProjectSchema` |
| Fichier migration | NNN-kebab-case | `001-add-avatar-url.ts` |
| Fichier de test | PascalCase + .test | `UserCard.test.tsx` |

**Regles strictes** :
- Le nom du fichier = le nom de l'export principal
- Acronymes en casse naturelle : `userId`, `apiKey` (pas `userID`, `APIKey`)

> Ref: Constitution V5 §7, §17
