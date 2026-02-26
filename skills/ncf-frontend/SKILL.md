---
name: ncf-frontend
description: |
  Patterns et regles frontend pour projets Next.js 16 + React + TypeScript + Tailwind + Shadcn.
  Utiliser des que l'utilisateur travaille sur un composant, une page, un formulaire, du style,
  du state management, un hook custom, de l'accessibilite, ou de la performance frontend.
  Couvre : Server/Client Components, Suspense, RSC serialisation, Zustand, react-hook-form,
  design tokens, a11y, memoisation, dynamic imports, next/image.
metadata:
  author: NCF
  version: 1.0.0
  category: frontend
---

# NCF Frontend Patterns

## 1. Server vs Client Components

**Tout est Server Component par defaut.** `"use client"` uniquement si :
- Interactivite : `onClick`, `onChange`, `onSubmit`
- Hooks React : `useState`, `useEffect`, `useRef`, `useContext`
- APIs navigateur : `localStorage`, `window`, `IntersectionObserver`

### Composition : children vs import

```tsx
// BIEN — children traversent la frontiere (restent Server Component)
"use client";
function InteractiveWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(!open)}>{children}</div>;
}

// page.tsx (Server Component)
<InteractiveWrapper>
  <HeavyServerComponent /> {/* reste Server Component */}
</InteractiveWrapper>
```

- Import direct dans `"use client"` → le composant importe DEVIENT client
- Render props (fonctions) → NE TRAVERSENT PAS la frontiere (non serialisable)
- Regle : preferer la composition (children) a l'import direct

### Serialisation RSC — Types autorises SC → CC

| Serialisable | Non serialisable |
|---|---|
| string, number, boolean, null, undefined | Function, class instance |
| Array, plain object (si contenu serialisable) | Map, Set, Symbol |
| Date (React 19+), React.ReactNode, Promise (avec use()) | |

En cas de doute, serialiser explicitement : `.toISOString()`, `Object.fromEntries()`, `Array.from()`.

## 2. Suspense & Streaming

- 1 `<Suspense>` par section de donnees independante
- Chaque `<Suspense>` a un **skeleton dedie** (pas un spinner generique)
- Ne jamais bloquer toute la page avec des `await` sequentiels

```tsx
// BIEN — Chaque section independante
<div className="grid gap-6 md:grid-cols-2">
  <Suspense fallback={<StatsSkeleton />}>
    <DashboardStats />
  </Suspense>
  <Suspense fallback={<ActivitySkeleton />}>
    <RecentActivity />
  </Suspense>
</div>
```

- `loading.tsx` + `error.tsx` obligatoires pour toute route avec fetch async

## 3. Composants — Regles

### Taille
| Seuil | Action |
|---|---|
| < 150 lignes | Ideal |
| 150-300 lignes | Acceptable si 1 seule responsabilite |
| 300-500 lignes | Decomposer obligatoirement |
| > 500 lignes | Interdit |

### Props
- Max 7 props metier (className, ref, aria-* ne comptent pas)
- Au-dela : regrouper en objet ou repenser l'architecture

### Decomposition
- Composant qui fait 2+ choses → dispatcher + sous-composants
- Formulaire dans 2+ dialogs → extraire `EntityFormFields`
- 1 fichier = 1 export principal. Nom fichier = nom export.

### Pattern skeleton par domaine
Chaque type d'entite a son skeleton : `[Entity]CardSkeleton.tsx`

## 4. useEffect — Autorise vs Interdit

| Autorise (side-effects reels) | Interdit |
|---|---|
| Subscriptions (WebSocket, EventListener) | Calculer un etat derive → `useMemo` |
| Timers (setInterval, setTimeout) | Transformer des props en state |
| DOM direct (focus, scroll) | Synchroniser 2 states → `useReducer` |
| Sync systeme externe (localStorage, SDK) | |

```tsx
// MAL
const [fullName, setFullName] = useState("");
useEffect(() => { setFullName(`${firstName} ${lastName}`); }, [firstName, lastName]);

// BIEN
const fullName = `${firstName} ${lastName}`;
```

## 5. Hooks customs

Creer un hook custom quand :
1. Meme combinaison useState + useEffect + useCallback dans 2+ composants
2. Composant a 5+ hooks et logique extractible
3. Pattern reutilisable (hover, scroll, polling)

Nommage : `use-[action]-[contexte].ts` (ex: `use-focus-hover.ts`)

## 6. State Management

### Zustand
- 1 store = 1 domaine = 1 fichier (`lib/stores/[domaine]-store.ts`)
- Separer state et actions : `// --- State ---` / `// --- Actions ---`
- `persist` uniquement si l'etat doit survivre a un refresh
- Pas de logique metier async dans le store

| Etat | Persist ? |
|---|---|
| Vue active, theme, preferences | Oui |
| Wizard en cours | Non |
| Selection temporaire | Non |

### Formulaires — 3 niveaux

| Complexite | Approche |
|---|---|
| Simple (1-3 champs) | `useState` individuels |
| Moyen (4-7 champs) | `useState` ou objet unique |
| Complexe (8+ champs) | `react-hook-form` + Zod |

Regle : Ne pas melanger useState et RHF pour les MEMES champs. useState pour l'UI auxiliaire (modal open, tab) autour d'un formulaire RHF = OK.

### Remote State

| Approche | Quand |
|---|---|
| RSC + `revalidatePath` | Mutations simples, pages serveur (defaut) |
| TanStack Query | Polling, infinite scroll, optimistic updates |
| `useOptimistic` (React 19) | Feedback instantane mutation unique |

Ne pas melanger les approches dans une meme feature.

### Local vs Global

| Situation | Ou stocker |
|---|---|
| Dialog open/close, recherche/filtre | `useState` local |
| Vue active, onglet, preferences | Zustand (persist) |
| Donnees formulaire | useState ou RHF local |
| Token auth, session | Context (Provider) |
| Donnees serveur | RSC ou useQuery |

## 7. CSS & Design Tokens

```tsx
// MAL
<div className="text-emerald-400 bg-[#1a1a2e] p-[13px]">

// BIEN
<div className="text-primary bg-card p-3">
```

- Toute couleur vient des tokens CSS de `globals.css`
- Layout flex imbrique : `flex-1 min-h-0` (jamais `h-full`)
- Responsive mobile-first : `hidden md:flex`, `p-3 md:p-4`

## 8. Accessibilite — 5 regles non-negociables

| Regle | Implementation |
|---|---|
| Navigation clavier | Tab, Enter, Escape sur tout interactif |
| Labels explicites | `<label>` ou `aria-label` sur tout input |
| Texte alternatif | `alt` descriptif ou `alt=""` si decoratif |
| Contraste | WCAG AA : 4.5:1 texte, 3:1 grands textes |
| Focus visible | `:focus-visible` — jamais `outline: none` |

- `<button type="button">` explicite (pas de submit accidentel)
- Jamais `<div onClick>` → `<button>` ou `<a>` semantique
- `aria-invalid` + `aria-describedby` sur champs en erreur
- Skip link en premier element focusable

```css
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; }
}
```

## 9. Performance

### Budget
| Metrique | Cible |
|---|---|
| JS par page critique | < 250KB gzip |
| LCP | < 2.5s mobile |
| Requetes initiales | < 5 |

### Memoisation
- `useMemo` : calculs couteux (filtrage, tri)
- `useCallback` : handlers passes a composants memoises
- Calcul trivial : inline, pas de memo

### Queries conditionnelles
```tsx
const data = useQuery(open ? fetchItems : null); // pas de fetch si dialog ferme
```

### Images
- Toujours `<Image>` de next/image (jamais `<img>`)
- `priority={true}` uniquement sur l'image LCP
- Toujours `width` + `height`

### Dynamic imports
Composants lourds / libs > 50KB :
```tsx
const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });
```

### N+1 queries
Jamais de fetch dans `.map()`. Batch fetch + Map pour le lookup.

## 10. Fichiers App Router

| Fichier | Role | Obligatoire ? |
|---|---|---|
| `page.tsx` | Contenu de la route | Oui |
| `layout.tsx` | Wrapper persistant | Root: oui |
| `loading.tsx` | Fallback Suspense | Oui si fetch async |
| `error.tsx` | Error boundary | Oui si fetch async |
| `not-found.tsx` | 404 | Recommande sur routes dynamiques |

### Caching (Next.js 15+)
- `fetch()` n'est plus cache par defaut
- Apres mutation → `revalidatePath()` ou `revalidateTag()` explicite
- Middleware : decisions de routage uniquement, pas de logique metier

### Server Actions
- `"use server"` = endpoint public → toujours valider + authentifier
- Si logique > 50 lignes → backend dedie, pas Server Action
- Toujours : Zod validation + auth check + revalidation
