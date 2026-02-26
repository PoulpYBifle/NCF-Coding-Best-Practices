# NCF — Regles projet

## Stack

Next.js 16 (App Router) · React · TypeScript · Tailwind CSS · Shadcn/ui · Zod · Zustand · Vitest

Package manager : `bun` (priorite) ou `npm`. Monorepo : `pnpm`.

## Reflexes de code (TOUJOURS, par defaut, sans y penser)

La securite et l'accessibilite ne sont PAS des etapes de review. Ce sont des reflexes de generation. Chaque ligne de code nait securisee et accessible. Comme le SEO sur un site SEO : on ne "rajoute pas le SEO" apres — chaque page est construite SEO-first.

### Securite — built-in a chaque ligne

| Quand j'ecris... | J'ecris AUTOMATIQUEMENT... |
|---|---|
| Un `<input>` utilisateur | Validation Zod client + serveur, `.max()` sur le schema |
| Une mutation backend | `requireAuth()` en ligne 1, `AppError({ code })` pour les erreurs |
| Un `fetch()` externe | `if (!res.ok) throw`, validation Zod de la reponse |
| Un champ texte libre | Limite `.max(200)` (titre) / `.max(2000)` (description) serveur-side |
| Un `dangerouslySetInnerHTML` | `DOMPurify.sanitize()` — aucune exception |
| Un redirect dynamique | Validation `/^\/(?!\/)/` (pas de `//` open redirect) |
| Un cookie de session | `httpOnly: true, secure: true, sameSite: "lax"` |
| Une variable d'environnement | Ajout dans `lib/env.ts` (schema Zod), crash au demarrage si manquante |
| Un endpoint API | Auth check OU documentation explicite si public |
| Un upload fichier | MIME type (magic bytes) + taille max serveur-side |

### Accessibilite — built-in a chaque composant

| Quand j'ecris... | J'ecris AUTOMATIQUEMENT... |
|---|---|
| Un `<input>` | `<label htmlFor="id">` associe OU `aria-label` — zero input orphelin |
| Un `<input>` avec erreur | `aria-invalid={!!error}` + `aria-describedby="[id]-error"` |
| Un `<img>` | `alt="description"` OU `alt=""` si decoratif |
| Un element cliquable | `<button type="button">` — jamais `<div onClick>` |
| Un dialog/modal | `aria-labelledby` + `aria-modal="true"` + focus trap |
| Un toast/notification | Librairie avec `aria-live` (sonner le fait nativement) |
| Un contenu dynamique | `aria-live="polite"` sur le conteneur |
| Des styles interactifs | `:focus-visible` avec outline visible — jamais `outline: none` |
| Une animation | `@media (prefers-reduced-motion: reduce)` respecte |
| Une page | Skip link en premier element focusable |
| Du texte | Contraste WCAG AA minimum (4.5:1 texte, 3:1 grands textes) |

**Ces deux tables ne sont PAS des checklists.** Ce sont des reflexes. L'IA ne doit jamais ecrire un `<input>` puis "verifier apres s'il a un label". Le `<label>` et le `<input>` sont ecrits ensemble, comme une seule unite.

## Workflow obligatoire (chaque feature)

Chaque demande de feature, bug fix ou refactoring suit ces 5 phases dans l'ordre. Aucune phase ne peut etre sautee.

### Phase 1 : EXPLORE

1. Lire les fichiers existants lies a la feature (composants, schemas, mutations, tests)
2. Identifier les patterns en place — ne pas inventer un pattern different
3. Verifier s'il existe deja un schema Zod, un hook, ou un composant reutilisable
4. Si le scope est flou, demander des clarifications AVANT de coder

### Phase 2 : PLAN

1. Definir ce que le test doit verifier (comportement attendu, cas limites)
2. Definir l'implementation (fichiers a creer/modifier, schema, mutation, composant)
3. Estimer si la feature respecte le budget : < 300 LoC par fichier, < 400 lignes de diff
4. **Identifier les surfaces de securite** : quels inputs utilisateur ? quelle auth ? quelles limites ?
5. **Identifier les besoins a11y** : quels interactifs ? quels formulaires ? quels feedbacks dynamiques ?

### Phase 3 : TEST RED

1. Ecrire le test AVANT le code (`__tests__/[Nom].test.ts(x)`)
2. Le test decrit le COMPORTEMENT attendu, pas l'implementation
3. **Inclure les assertions de securite** : rejet si non-auth, rejet si input invalide, rejet si doublon
4. **Inclure un test a11y** sur les composants : `expect(await axe(container)).toHaveNoViolations()`
5. Lancer `npx vitest run [fichier]` — le test DOIT echouer (red)
6. Si le test passe deja, il ne teste rien d'utile — le reecrire

### Phase 4 : CODE GREEN

1. Ecrire le MINIMUM de code pour que le test passe
2. **Appliquer les reflexes** (tables ci-dessus) : chaque input nait avec son label, chaque mutation nait avec son auth check
3. Suivre les patterns du projet (voir skills ncf-frontend, ncf-backend)
4. Lancer `npx vitest run [fichier]` — le test DOIT passer (green)
5. Refactorer si necessaire (le test protege contre les regressions)

### Phase 5 : VALIDATE (filet de securite)

Cette phase est un filet, pas le mecanisme principal. Si les reflexes de Phase 4 sont appliques, la plupart des points sont deja couverts.

1. Lancer les verifications :
   - `npx tsc --noEmit` — zero erreur TypeScript
   - `npx vitest run` — tous les tests passent (dont tests a11y et securite)
2. Scan rapide des points que les tests ne couvrent pas :
   - Pas de couleurs hardcodees ? Tokens CSS uniquement ?
   - `loading.tsx` + `error.tsx` si route avec fetch async ?
   - `flex-1 min-h-0` dans les layouts flex imbriques ?
   - Pas de `console.log` restant ?
3. Si un point echoue, corriger et relancer
4. Commit conventionnel : `feat|fix|refactor(scope): description`

## Ce que les hooks gerent deja (NE PAS dupliquer)

| Hook | Verification |
|---|---|
| pre-commit (lint-staged) | Prettier + ESLint sur fichiers stages |
| pre-push | `tsc --noEmit` + `vitest run` |
| CI (GitHub Actions) | Types + lint + format + tests + build |

L'IA se concentre sur ce qu'un linter ne peut PAS verifier : logique metier, patterns d'architecture, securite applicative, a11y semantique.

## Regles non-negociables

### Code
- Zero `any` — utiliser `unknown` + type guard
- Zero `as` sans `// EXCEPTION-TYPECAST: [raison]`
- Composant > 500 lignes = interdit. > 300 = decomposer.
- 1 fichier = 1 export principal. Nom fichier = nom export.
- Pas de `useEffect` pour etat derive — `useMemo` ou calcul inline
- Pas de `console.log` en production — logger structure

### Backend
- Toute mutation : AUTH → VALIDATION → VERIFICATION → OPERATION
- Toute erreur : `AppError({ code, message })` avec code standardise
- Toute liste : paginee et bornee (`limit` + `sort`)
- Toute mutation non-idempotente : idempotency key

### Frontend
- Server Component par defaut. `"use client"` uniquement si interactivite/hooks/APIs navigateur
- Toute mutation : try/catch + toast.success/error
- Toute route avec fetch async : `loading.tsx` + `error.tsx`
- Tokens CSS uniquement — zero couleur/taille hardcodee
- `flex-1 min-h-0` dans les layouts flex imbriques (pas `h-full`)

### Securite (hardening — pas optionnel)
- Tout input utilisateur : valide avec Zod + `.max()` client ET serveur
- Tout endpoint : auth check en ligne 1 (sauf public documente explicitement)
- Variables d'environnement validees avec Zod (`lib/env.ts`) — crash au demarrage si manquant
- Cookies de session : `httpOnly`, `secure`, `sameSite: lax` — les 3 toujours
- Schemas Zod partages dans `lib/schemas/` — source unique de verite
- Ne jamais faire confiance au client — TOUTE validation client repliquee cote serveur
- Pas de secrets dans `NEXT_PUBLIC_*` — expose au client
- `fetch()` externe : toujours `res.ok` + validation Zod de la reponse

### Accessibilite (a11y — pas optionnel)
- Tout `<input>` a un `<label>` ou `aria-label` — zero input orphelin
- Tout interactif : `<button>` ou `<a>`, jamais `<div onClick>`
- Tout `<img>` : `alt` descriptif ou `alt=""` si decoratif
- Champs en erreur : `aria-invalid` + `aria-describedby`
- `:focus-visible` sur tous les interactifs — jamais `outline: none`
- Contraste WCAG AA : 4.5:1 texte, 3:1 grands textes

## Conventions de nommage

| Element | Convention |
|---|---|
| Composant, Type, Interface | PascalCase |
| Fonction, variable, hook | camelCase |
| Constante | UPPER_SNAKE_CASE |
| Fichier composant | PascalCase.tsx |
| Fichier utilitaire/hook | kebab-case.ts |
| Table DB (SQL) | snake_case |
| Schema Zod | camelCase + Schema |
| Migration | NNN-kebab-case.ts |
| Commit | feat\|fix\|refactor(scope): description |
| Branche | feat/nom \| fix/nom \| refactor/nom |

## Structure fichiers

```
app/                    ← Routes Next.js (App Router)
  (auth)/               ← Routes publiques
  (app)/                ← Routes protegees
    [route]/page.tsx + loading.tsx + error.tsx
backend/                ← 1 fichier = 1 domaine (max 250 LoC)
components/
  ui/                   ← Shadcn (NE PAS MODIFIER)
  layout/               ← Shell, Sidebar, TopBar
  [domaine]/            ← Composants par domaine metier
lib/
  schemas/              ← Schemas Zod partages (source de verite)
  stores/               ← Zustand (1 store = 1 domaine)
  hooks/                ← Hooks customs reutilisables
  env.ts                ← Validation variables d'environnement
  logger.ts             ← Logger structure
  utils.ts              ← cn(), formatDate(), etc.
tests/
  helpers/              ← Factories, MSW handlers
  e2e/                  ← Playwright
```

## Skills disponibles

| Skill | Quand |
|---|---|
| `ncf-frontend` | Composant, page, UI, formulaire, style, state, hook, a11y |
| `ncf-backend` | API, mutation, query, DB, migration, auth, securite |
| `ncf-review` | Validation post-code, anti-patterns, checklist qualite |

## Exceptions

Une exception est acceptable uniquement si :
1. Le cout de la regle depasse le benefice
2. Documentee : `// EXCEPTION: [raison]`
3. Locale — pas un pattern a repeter
