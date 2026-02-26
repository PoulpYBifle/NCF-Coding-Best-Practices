# React & Next.js — Patterns

## Server vs Client Components

**Tout est Server Component par defaut.** Un composant devient Client (`"use client"`) uniquement si :

| Raison | Exemple |
|---|---|
| Interactivite | `onClick`, `onChange`, `onSubmit` |
| Hooks React | `useState`, `useEffect`, `useRef` |
| APIs navigateur | `localStorage`, `window`, `IntersectionObserver` |

## Composition : children vs import

- **children** (`React.ReactNode`) → traversent la frontiere serveur/client (restent SC)
- **Import direct** dans un fichier `"use client"` → le composant importe devient client
- **Render props** (fonctions) → ne traversent PAS la frontiere (non serialisable)

**Regle** : Toujours preferer la composition (`children`) a l'import direct pour garder le maximum de code cote serveur.

## Serialisation RSC — Types autorises SC → CC

| Serialisable | Non serialisable |
|---|---|
| `string`, `number`, `boolean`, `null`, `undefined` | `Function`, `class instance` |
| `Array`, `plain object` (si contenu serialisable) | `Map`, `Set`, `Symbol` |
| `Date` (React 19+), `React.ReactNode`, `Promise` (avec `use()`) | |

## Suspense & Streaming

- 1 `<Suspense>` par section de donnees independante (pas un seul pour toute la page)
- Chaque `<Suspense>` a un **skeleton dedie** (pas un spinner generique)
- Ne jamais bloquer toute la page avec des `await` sequentiels
- `loading.tsx` + `error.tsx` **obligatoires** pour toute route avec fetch async

## Limites de taille composants

| Seuil | Action |
|---|---|
| < 150 lignes | Ideal |
| 150-300 lignes | Acceptable si une seule responsabilite |
| 300-500 lignes | Decomposer obligatoirement |
| > 500 lignes | **Interdit** |

## Regles de props

- **Max 7 props metier** par composant (className, ref, aria-* ne comptent pas)
- Au-dela, regrouper en objet ou repenser l'architecture

## useEffect — Usage autorise vs interdit

| Autorise (side-effects reels) | Interdit |
|---|---|
| Subscriptions (WebSocket, EventListener) | Calculer un etat derive → `useMemo` |
| Timers (setInterval, setTimeout) | Transformer des props en state |
| DOM direct (focus, scroll) | Synchroniser 2 states entre eux → `useReducer` |
| Sync systeme externe (localStorage, SDK) | |

## Hooks customs — Quand creer

1. Meme combinaison `useState` + `useEffect` + `useCallback` dans 2+ composants
2. Un composant a 5+ hooks et la logique est extractible
3. Un pattern (hover, scroll, polling) est reutilisable

**Nommage** : `use-[action]-[contexte].ts` (ex: `use-focus-hover.ts`)

## Fichiers App Router

| Fichier | Role | Obligatoire ? |
|---|---|---|
| `page.tsx` | Contenu de la route | Oui |
| `layout.tsx` | Wrapper persistant | Root: oui |
| `loading.tsx` | Fallback Suspense route-level | Oui si fetch async |
| `error.tsx` | Error boundary | Oui si fetch async |
| `not-found.tsx` | 404 | Recommande sur routes dynamiques |

## Caching (Next.js 15+)

- `fetch()` n'est **plus cache par defaut** (changement vs Next.js 14)
- Apres toute mutation → `revalidatePath()` ou `revalidateTag()` explicite
- Middleware : decisions de routage uniquement, pas de logique metier lourde

> Ref: Constitution V5 §3, §6
