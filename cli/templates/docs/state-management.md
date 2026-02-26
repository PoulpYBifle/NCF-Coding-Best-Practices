# State Management

## Zustand — Conventions

**1 store = 1 domaine = 1 fichier.** Nommage : `lib/stores/[domaine]-store.ts`

| Etat | Persist ? |
|---|---|
| Vue active, theme, preferences | Oui |
| Wizard / formulaire multi-etapes en cours | Non (reset au refresh) |
| Selection temporaire (checkbox, drag) | Non |
| Filtres de recherche | Selon UX |

**Regles** :
- Separer state et actions dans l'interface (`// --- State ---` / `// --- Actions ---`)
- Les actions qui changent la vue doivent reset les sous-etats
- Pas de logique metier async dans le store (pas d'appels DB)

## Formulaires — 3 niveaux

| Complexite | Cas d'usage | Approche |
|---|---|---|
| Simple (1-3 champs) | Recherche, filtre | `useState` individuels |
| Moyen (4-7 champs) | CRUD | `useState` individuels ou objet unique |
| Complexe (8+ champs) | Wizard, onboarding | `react-hook-form` + `Zod` |

**Regle** : Ne pas melanger `useState` et `react-hook-form` pour gerer les **memes champs**. Un `useState` pour l'UI auxiliaire (modal open, tab actif) autour d'un formulaire RHF est un pattern correct.

## Remote State (server state cote client)

| Approche | Quand l'utiliser |
|---|---|
| **RSC + `revalidatePath`** | Mutations simples, pages principalement serveur (recommande par defaut) |
| **TanStack Query** | Polling, infinite scroll, optimistic updates complexes |
| **SWR** | Alternative plus legere a TanStack Query |
| **`useOptimistic`** (React 19) | Feedback instantane sur mutation unique |

**Regle** : Ne pas melanger les approches dans une meme feature. Si une page utilise TanStack Query, toutes ses mutations passent par TanStack Query.

## Etat local vs global

| Situation | Ou stocker |
|---|---|
| Dialog open/close | `useState` local |
| Recherche/filtre dans une vue | `useState` local |
| Vue active, onglet | Zustand (persist) |
| Preferences utilisateur | Zustand (persist) |
| Donnees formulaire en cours | `useState` ou RHF local |
| Token auth, session | Context (Provider) |
| Donnees serveur | RSC, ou `useQuery` si pages tres interactives |

**Regle** : Si l'etat doit survivre a un changement de vue ou refresh → Zustand persist. Sinon → local.

> Ref: Constitution V5 §4
