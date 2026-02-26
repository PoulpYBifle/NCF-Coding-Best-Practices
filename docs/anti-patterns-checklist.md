# Anti-patterns & Checklist PR

## Les 42 interdits absolus (resume)

| # | Anti-pattern | Correction |
|---|---|---|
| 1 | `console.log` en production | Logger structure |
| 2 | `any` sans justification | `unknown` + type guard |
| 3 | `as` cast sans `// EXCEPTION-TYPECAST` | Documenter ou adapter l'interface |
| 4 | Copier-coller > 3 lignes (meme raison) | Extraire helper/composant |
| 5 | Composant > 500 lignes | Decomposer |
| 6 | `useEffect` pour etat derive | `useMemo` ou calcul inline |
| 7 | Mutation sans try/catch | try/catch + toast |
| 8 | Mutation sans feedback utilisateur | toast.success/error |
| 9 | Couleur hardcodee | Token CSS |
| 10 | `h-full` dans flex imbrique | `flex-1 min-h-0` |
| 11 | `dangerouslySetInnerHTML` sans sanitize | DOMPurify |
| 12 | Route API sans auth (sauf public) | Auth check |
| 13 | Champ texte sans limite de taille | Validation serveur |
| 14 | 2 endpoints pour la meme operation | Source unique |
| 15 | Nom fichier != nom export | Renommer |
| 16 | Seed data dans fichier logique | Fichier separe |
| 17 | Query dans dialog ferme | Conditionner sur `open` |
| 18 | `fetch()` sans `res.ok` | Check + throw |
| 19 | Melange useState + RHF (memes champs) | Un seul systeme par champ |
| 20 | `throw Error` generique | Erreur structuree avec code |
| 21 | `key={index}` dans liste dynamique | ID stable |
| 22 | Fetch dans `.map()` (N+1) | `Promise.all` ou batch |
| 23 | Datetime sans timezone | Timestamp ms UTC |
| 24 | Mutation non-idempotente sans cle | Idempotency key |
| 25 | `<div onClick>` sans semantique | `<button type="button">` |
| 26 | Import relatif > 1 niveau | Path alias `@/` |
| 27 | Hard delete sans evaluation | Table de decision soft/hard |
| 28 | Timestamp pour date calendaire | String `YYYY-MM-DD` |
| 29 | Formatage date cote serveur | Client uniquement |
| 30 | Mutation sans `updatedAt` | Toujours mettre a jour |
| 31 | Side-effect bloquant dans mutation | Scheduler/queue |
| 32 | Migration destructive sans backfill | Optionnel → backfill → obligatoire |
| 33 | Barrel export hors `ui/`/`hooks/` | Import direct |
| 34 | Rate limiter in-memory en serverless | Service externe |
| 35 | Spinner plein ecran pour operation locale | Skeleton/useTransition |
| 36 | Etat intermediaire visible | Filtrer dans les queries |
| 37 | Cookie sans `httpOnly` + `secure` | Flags securises |
| 38 | Fonction/Map/Set en prop SC → CC | Types serialisables |
| 39 | Schema Zod en double | Source unique `lib/schemas/` |
| 40 | Update concurrent sans locking | Version field + CONFLICT |
| 41 | `--no-verify` sur git | Jamais |
| 42 | `console.log` oublie avant commit | Lint rule + hook |

## Patterns suspects (pas interdits, mais a surveiller)

| Pattern | OK quand | Probleme quand |
|---|---|---|
| 8+ useState | Champs independants | Champs lies → useReducer |
| Promise.all avec map | Liste bornee (< 50) | Liste non bornee → pagination |
| Ternaire imbrique | 2 niveaux max | 3+ → fonction nommee |
| `useEffect` avec `[]` | Init unique (focus) | Fetch de donnees → useQuery |

## Checklist PR (resume)

**Backend** : Auth check, erreurs structurees, pagination, limites de taille, idempotence
**Frontend** : Composant < 300 LoC, try/catch + toast, queries conditionnelles, tokens CSS
**Contrats** : Types Zod partages, contract tests, serialisation SC → CC
**TypeScript** : Zero any, zero as non documente, never dans switch, satisfies
**A11y** : Labels, clavier, contraste, aria-invalid, alt sur images
**Tests** : Au moins 1 test sur code modifie, contract tests a jour
**Securite** : Cookies securises, CSRF, pas de secrets dans `NEXT_PUBLIC_*`
**General** : `tsc --noEmit`, `eslint`, `prettier --check`, diff < 400 lignes

> Ref: Constitution V5 §24, §25
