---
name: ncf-review
description: |
  Validation post-code, anti-patterns et checklist qualite pour projets NCF.
  Utiliser apres avoir ecrit du code, quand l'utilisateur demande de valider,
  reviewer, verifier, ou quand la Phase 5 (VALIDATE) du workflow est atteinte.
  Utiliser aussi quand l'utilisateur dit "checklist", "review", "anti-patterns",
  "qualite", "verifie mon code", ou prepare une PR.
metadata:
  author: NCF
  version: 1.0.0
  category: quality
---

# NCF Code Review & Validation

## Processus de validation

Apres chaque implementation, executer cette validation en 3 etapes :

### Etape 1 : Verifications automatiques

Lancer dans l'ordre :
```bash
npx tsc --noEmit          # Zero erreur TypeScript
npx vitest run             # Tous les tests passent
```

Si un check echoue → corriger AVANT de continuer.

Note : ESLint et Prettier sont geres par les hooks pre-commit (lint-staged). Ne pas les relancer manuellement sauf pour diagnostiquer un probleme.

### Etape 2 : Verifications manuelles (ce que les outils ne detectent pas)

Passer en revue chaque fichier modifie avec cette checklist :

#### Backend

- [ ] Auth check sur toute query/mutation scopee
- [ ] Erreur structuree `AppError({ code, message })` (pas `new Error`)
- [ ] `filterUndefined()` pour les patches partiels
- [ ] Pagination sur les queries de liste (limit + sort)
- [ ] Limites de taille sur les champs texte (serveur-side)
- [ ] Pas de duplication de mutation (1 operation = 1 endpoint)
- [ ] Idempotency key sur les mutations non-idempotentes (creation, paiement, email)
- [ ] Optimistic locking si edition concurrente possible
- [ ] `updatedAt` mis a jour sur chaque patch

#### Frontend

- [ ] Composant < 300 lignes (ou decompose avec `// EXCEPTION:`)
- [ ] Nom fichier = nom export principal
- [ ] try/catch + toast.success/error sur toute mutation
- [ ] Queries conditionnees sur `open` dans les dialogs/sheets
- [ ] Pas de couleurs hardcodees (tokens CSS uniquement)
- [ ] `flex-1 min-h-0` dans les layouts flex imbriques (pas `h-full`)
- [ ] Erreurs API mappees vers les champs de formulaire quand pertinent
- [ ] `loading.tsx` + `error.tsx` si nouvelle route avec fetch async

#### Contrats API

- [ ] Types derives de schemas Zod partages (`lib/schemas/`)
- [ ] Pas de types definis manuellement si un type genere existe
- [ ] Contract tests pour les schemas modifies
- [ ] Seuls des types serialisables passent la frontiere SC → CC

#### TypeScript

- [ ] Zero `any`
- [ ] Zero `as` non documente (`// EXCEPTION-TYPECAST: [raison]`)
- [ ] Interfaces de props explicites et nommees
- [ ] `never` dans les switch exhaustifs
- [ ] `satisfies` prefere a `as` quand possible

#### Accessibilite

- [ ] Tout `<input>` a un `<label>` associe ou `aria-label`
- [ ] Tout element interactif navigable au clavier
- [ ] Contraste texte suffisant (WCAG AA)
- [ ] `<img>` avec `alt` descriptif ou `alt=""`
- [ ] `aria-invalid` + `aria-describedby` sur champs en erreur
- [ ] Pas de `<div onClick>` → `<button type="button">`

#### Securite

- [ ] Cookies de session avec flags securises (httpOnly, secure, sameSite)
- [ ] CSRF protege pour mutations sensibles
- [ ] Pas de secrets dans `NEXT_PUBLIC_*`
- [ ] Upload valide (MIME type + taille serveur-side)
- [ ] Variables d'environnement nouvelles ajoutees dans `lib/env.ts`

#### Tests

- [ ] Au moins 1 test sur le code modifie
- [ ] Tests existants toujours verts
- [ ] Contract tests mis a jour si un schema a change

#### Observabilite

- [ ] Correlation ID propage dans les nouveaux endpoints
- [ ] Erreurs critiques capturees par error tracking
- [ ] Pas de `console.log` restant

#### General

- [ ] Diff relue — pas de secrets, pas de fichiers inutiles
- [ ] Pas de fichier > 300 LoC sans justification
- [ ] Imports avec path alias `@/` (pas de `../../..`)

### Etape 3 : Rapport de validation

Generer un rapport concis :

```
## Rapport de validation

**Fichiers modifies** : [liste]
**Tests** : X passes, 0 echoues
**TypeScript** : 0 erreurs

### Checklist
- [x] Auth : OK (auth check dans createInvitation)
- [x] Erreurs : OK (AppError avec code VALIDATION, CONFLICT)
- [x] Frontend : OK (try/catch + toast, composant 120 LoC)
- [x] A11y : OK (labels, aria-invalid)
- [ ] Tests : MANQUANT — pas de contract test pour invitationSchema
  → Action : ajouter lib/schemas/__tests__/invitation.contract.test.ts

### Verdict : 1 point a corriger avant commit
```

## Les 42 anti-patterns interdits

### Critiques (bugs ou failles garantis)

| # | Anti-pattern | Correction |
|---|---|---|
| 1 | `any` sans justification | `unknown` + type guard |
| 2 | `as` cast sans documentation | `// EXCEPTION-TYPECAST` |
| 3 | Mutation sans auth check | AUTH en premiere ligne |
| 4 | Mutation sans try/catch (frontend) | try/catch + toast |
| 5 | `dangerouslySetInnerHTML` sans sanitize | DOMPurify |
| 6 | Cookie sans `httpOnly` + `secure` | Flags securises |
| 7 | Secret dans `NEXT_PUBLIC_*` | Variable serveur |
| 8 | Route API sans auth (sauf public documente) | Auth check |
| 9 | `console.log` en production | Logger structure |
| 10 | `--no-verify` sur git | Jamais |

### Graves (dette technique ou UX degradee)

| # | Anti-pattern | Correction |
|---|---|---|
| 11 | Composant > 500 lignes | Decomposer |
| 12 | useEffect pour etat derive | useMemo ou inline |
| 13 | Couleur hardcodee | Token CSS |
| 14 | `h-full` dans flex imbrique | `flex-1 min-h-0` |
| 15 | 2 endpoints pour la meme operation | Source unique |
| 16 | Nom fichier != nom export | Renommer |
| 17 | Fetch dans `.map()` (N+1) | Batch fetch |
| 18 | `fetch()` sans `res.ok` | Check + throw |
| 19 | Melange useState + RHF (memes champs) | Un seul systeme |
| 20 | `throw Error` generique | AppError({ code }) |
| 21 | `key={index}` dans liste dynamique | ID stable |
| 22 | `<div onClick>` sans semantique | `<button>` |
| 23 | Import relatif > 1 niveau | Path alias `@/` |
| 24 | Barrel export hors ui/hooks | Import direct |
| 25 | Spinner plein ecran pour op locale | Skeleton/transition |

### Moderees (coherence et maintenabilite)

| # | Anti-pattern | Correction |
|---|---|---|
| 26 | Copier-coller > 3 lignes (meme raison) | Extraire helper |
| 27 | Mutation sans feedback utilisateur | toast.success/error |
| 28 | Champ texte sans limite | Validation serveur |
| 29 | Seed data dans fichier logique | Fichier separe |
| 30 | Query dans dialog ferme | Conditionner sur `open` |
| 31 | Datetime sans timezone | Timestamp ms UTC |
| 32 | Mutation non-idempotente sans cle | Idempotency key |
| 33 | Hard delete sans evaluation | Table de decision |
| 34 | Timestamp pour date calendaire | String YYYY-MM-DD |
| 35 | Formatage date cote serveur | Client uniquement |
| 36 | Mutation sans `updatedAt` | Toujours mettre a jour |
| 37 | Side-effect bloquant dans mutation | Scheduler/queue |
| 38 | Migration destructive sans backfill | Optionnel → backfill |
| 39 | Rate limiter in-memory serverless | Service externe |
| 40 | Etat intermediaire visible | Filtrer dans queries |
| 41 | Schema Zod en double | Source unique lib/schemas |
| 42 | Update concurrent sans locking | Version + CONFLICT |

## Patterns suspects (pas interdits, a surveiller)

| Pattern | OK quand | Probleme quand |
|---|---|---|
| 8+ useState | Champs independants | Champs lies → useReducer |
| Promise.all avec map | Liste bornee (< 50) | Non bornee → pagination |
| Ternaire imbrique | 2 niveaux max | 3+ → fonction nommee |
| useEffect avec [] | Init unique (focus) | Fetch → useQuery |
| Optimistic UI | Action rapide avec rollback | Action complexe sans rollback |

## Decision trees

### Soft delete vs Hard delete
```
L'entite a de la valeur pour l'utilisateur ?
  → Oui : Soft delete (deletedAt)
  → Non : L'entite est ephemere (token, session) ?
    → Oui : Hard delete
    → Non : Obligation legale (RGPD) ?
      → Oui : Hard delete
      → Non : Soft delete
```

### Cache strategy
```
Donnees statiques / marketing ?
  → Oui : ISR avec revalidate (3600s)
  → Non : Donnees specifiques a l'utilisateur ?
    → Oui : Pas de cache ou TTL court
    → Non : Donnees partagees rarement modifiees ?
      → Oui : unstable_cache avec tag
      → Non : dynamic = "force-dynamic"
```

### State location
```
L'etat doit survivre au refresh ?
  → Oui : Zustand persist
  → Non : L'etat est utilise par plusieurs composants distants ?
    → Oui : Zustand (sans persist)
    → Non : useState local
```
