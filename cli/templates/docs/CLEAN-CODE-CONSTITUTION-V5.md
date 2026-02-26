# Clean Code Constitution V5

> **But** : Regles non negociables pour tout projet Next.js (App Router) + React + TypeScript.
> **Philosophie** : Un code clean n'est pas un code parfait -- c'est un code que n'importe qui peut comprendre, modifier et etendre en 5 minutes sans lire 400 lignes de contexte.
> **Audience** : Developpeurs humains et agents de code IA. Ce document est la loi du projet.
> **Architecture** : Ce document contient les regles universelles. Les implementations specifiques a un backend (Convex, Supabase, Drizzle...) sont dans des **add-ons** separes. Voir Annexe A.

### Changelog V4 -> V5

- **Corrections factuelles** : §3.1 (children vs render props), §7.2 (cast redondant), §7.4 (barrel exports), §4.2 (useState + RHF), §6.3 (middleware DB).
- **Nouveaux chapitres** : §8 Contrats API & Serialisation RSC, §11 Idempotence & Concurrence, §19 Observabilite (remplace l'ancien §20 Logging), §23 DX Tooling & Enforcement.
- **Chapitres enrichis** : §4 Remote State, §9 Securite (sessions, CSRF, cookies), §13 Dates (date-only), §18 Tests (MSW, coverage, contract tests).
- **Score council V4** : 78.4/100 — lacunes convergentes sur contrats API (5/5), observabilite (5/5), idempotence (4/5), securite session (4/5).

---

## 0. Meta-regle : Politique d'exception

Aucune regle n'est absolue. Une exception est acceptable **uniquement si** :

1. Le cout de la regle depasse le benefice immediat.
2. Elle est documentee : `// EXCEPTION: [raison]`.
3. Elle est locale -- pas un pattern a repeter.

```tsx
// BIEN -- Exception documentee et locale
// EXCEPTION: SDK pdf.js retourne un type opaque, cast necessaire
const textItem = item as PdfTextItem;

// MAL -- Exception silencieuse
const data = response as any; // <- pas de raison, pas de commentaire
```

---

## 1. Philosophie generale

### Les 5 commandements

```
1. KISS > Clever       -- La solution ennuyeuse qui marche bat le hack elegant.
2. DRY au bon moment   -- "Duplication is far cheaper than the wrong abstraction" (Sandi Metz).
                         Ne pas factoriser avant 3 occurrences ET des raisons de changement identiques.
3. SRP > God Object    -- Un fichier fait UNE chose. Un composant rend UN concept.
4. Explicit > Magic    -- Pas de comportements caches. Le code se lit comme une histoire.
5. Delete > Comment    -- Du code mort se supprime. Un commentaire explique le "pourquoi", jamais le "quoi".
```

### La regle des 3 (avec jugement)

- **3 lignes identiques** avec la meme raison de changement -> extraire une fonction.
- **3 props similaires** entre composants -> extraire un composant partage.
- **3 fichiers** qui font le meme pattern -> extraire un hook ou un helper.

> Deux fonctions backend qui valident un email de la meme facon -> factoriser.
> Deux composants qui ont 3 lignes de JSX similaires mais des evolutions independantes -> NE PAS factoriser.

### La regle du "5 minutes"

> Un nouveau developpeur (ou un agent de code) doit pouvoir comprendre ce que fait un fichier en 5 minutes max. Si ca prend plus longtemps, le fichier est trop complexe.

---

## 2. Architecture fichiers

### 2.1 Structure de base

```
project/
├── backend/               <- 1 fichier = 1 domaine metier (ou src/server/, api/, etc.)
│   ├── helpers.ts          <- Utilitaires partages (auth, validation, formatage)
│   ├── schema.ts           <- Source de verite des types
│   ├── users.ts            <- CRUD utilisateurs
│   ├── posts.ts            <- CRUD posts
│   └── migrations/         <- 1 fichier par migration (NNN-description.ts)
├── app/
│   ├── layout.tsx          <- Root layout (providers, fonts, metadata)
│   ├── middleware.ts       <- Auth, redirects, rate limiting (1 seul fichier)
│   ├── (auth)/             <- Routes publiques (login, signup)
│   ├── (app)/              <- Routes protegees
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx  <- Obligatoire si fetch async
│   │   │   └── error.tsx    <- Obligatoire si fetch async
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
├── components/
│   ├── ui/                 <- Composants shadcn (NE PAS MODIFIER)
│   ├── layout/             <- Shell, Sidebar, TopBar, BottomBar
│   ├── [domaine]/          <- Composants par domaine metier
│   │   ├── [Entity]Card.tsx
│   │   ├── [Entity]Form.tsx
│   │   ├── [Entity]Detail.tsx
│   │   ├── [Entity]List.tsx
│   │   └── [Entity]CardSkeleton.tsx  <- Skeleton dedie par type
│   └── views/              <- Orchestrateurs de page (1 par vue)
├── lib/
│   ├── stores/             <- Zustand stores (1 par domaine)
│   ├── hooks/              <- Custom hooks reutilisables
│   ├── services/           <- Operations multi-etapes
│   ├── schemas/            <- Schemas Zod partages (contrats API)
│   ├── env.ts              <- Validation des variables d'environnement (Zod)
│   ├── logger.ts           <- Logger structure (remplace console.log)
│   └── utils.ts            <- cn(), formatDate(), etc.
├── tests/
│   ├── helpers/            <- Mocks et utilitaires de test partages
│   └── e2e/                <- Tests Playwright
└── docs/                   <- Documentation projet
    └── adr/                <- Architecture Decision Records
```

### 2.2 Regles strictes

**1 fichier backend = 1 domaine metier, max 250 lignes de logique.**

```
BIEN :
  users.ts      (120 LoC -- CRUD users)
  posts.ts      (95 LoC -- CRUD posts)

MAL :
  api.ts        (850 LoC -- TOUT)
```

Si un fichier backend depasse 250 lignes de logique (hors seed data, hors types), il doit etre scinde. Les helpers prives restent dans le meme fichier tant qu'ils ne sont pas partages.

> Pour l'implementation concrete de votre backend, voir `addon-[votre-backend].md`.

**1 composant = 1 fichier = 1 export principal.**

```
BIEN :
  UserCard.tsx       -> export function UserCard
  AddUserDialog.tsx  -> export function AddUserDialog

MAL :
  UserComponents.tsx -> export function UserCard, UserList, UserDetail
  UserUploadSheet.tsx -> export function AddUserDialog   <- nom different de l'export
```

**Seed data et constantes volumineuses dans des fichiers separes.**

**Les fichiers de test vivent a cote du code (`__tests__/`), sauf les E2E et helpers partages qui vivent dans `tests/`.**

---

## 3. Composants React

### 3.1 Server Components vs Client Components

**Regle fondamentale : Tout est Server Component par defaut.**

Un composant devient Client (`"use client"`) uniquement si il a besoin de :

1. **Interactivite** : `onClick`, `onChange`, `onSubmit`
2. **Hooks React** : `useState`, `useEffect`, `useRef`, `useContext`
3. **APIs navigateur** : `localStorage`, `window`, `navigator`, `IntersectionObserver`

```tsx
// BIEN -- Server Component (par defaut, pas de directive)
async function UserList() {
  const users = await fetchUsers(); // fetch cote serveur
  return (
    <div>
      {users.map(u => <UserCard key={u.id} user={u} />)}
      <UserSearchBar /> {/* Client Component imbrique */}
    </div>
  );
}

// BIEN -- Client Component (justifie par l'interactivite)
"use client";
function UserSearchBar() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// MAL -- "use client" sur un composant qui n'en a pas besoin
"use client"; // <- pourquoi ? Aucun hook, aucune interactivite
function Footer() {
  return <footer>Copyright 2026</footer>;
}
```

**Frontiere de module : `children` vs render props.**

La directive `"use client"` marque une **frontiere de module**. Les composants **importes** dans un fichier client deviennent clients. Mais les composants **passes via `children`** (type `React.ReactNode`) **restent des Server Components** car ils sont deja rendus cote serveur avant d'etre passes.

> **Attention** : Les **render props** (fonctions `(data) => <Component />`) ne traversent PAS la frontiere serveur/client. Une fonction n'est pas serialisable. Seuls les `React.ReactNode` deja rendus passent.

```tsx
// BIEN -- Pattern composition : le wrapper est client, les enfants restent serveur
"use client";
function InteractiveWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(!open)}>{children}</div>;
}

// page.tsx (Server Component)
export default function Page() {
  return (
    <InteractiveWrapper>
      <HeavyServerComponent /> {/* <- reste un Server Component ! */}
    </InteractiveWrapper>
  );
}

// MAL -- Render prop : la fonction ne peut pas etre serialisee SC -> CC
"use client";
function DataWrapper({ render }: { render: (data: string) => React.ReactNode }) {
  // ERREUR RUNTIME : une fonction n'est pas serialisable depuis un Server Component
  return <div>{render("hello")}</div>;
}

// MAL -- Import direct qui force tout en client
"use client";
import { HeavyComponent } from "./HeavyComponent"; // <- devient client
function Wrapper() {
  const [open, setOpen] = useState(false);
  return <HeavyComponent />;
}
```

**Regle** : Toujours preferer la composition (children) a l'import direct pour garder le maximum de code cote serveur. Ne jamais passer de fonctions comme props d'un Server Component vers un Client Component.

**`loading.tsx` et `error.tsx` obligatoires** pour toute route avec fetch asynchrone.

### 3.2 Serialisation RSC : types autorises

Quand un Server Component passe des props a un Client Component, les valeurs traversent la frontiere reseau. Seuls les types serialisables sont autorises.

| Type | Serialisable SC -> CC ? |
|---|---|
| `string`, `number`, `boolean`, `null` | Oui |
| `undefined` | Oui |
| `Array`, `plain object` | Oui (si contenu serialisable) |
| `Date` | Oui (depuis React 19) |
| `Map`, `Set` | Non |
| `Function`, `class instance` | Non |
| `Symbol` | Non |
| `React.ReactNode` (JSX deja rendu) | Oui (via children/props) |
| `Promise` (avec `use()`) | Oui (streaming) |

```tsx
// MAL -- Map n'est pas serialisable
async function ServerParent() {
  const lookup = new Map([["a", 1], ["b", 2]]);
  return <ClientChild lookup={lookup} />; // ERREUR RUNTIME
}

// BIEN -- Convertir en type serialisable
async function ServerParent() {
  const lookup = Object.fromEntries([["a", 1], ["b", 2]]);
  return <ClientChild lookup={lookup} />;
}
```

**Regle** : Avant de passer une valeur d'un SC a un CC, verifier qu'elle est dans la liste des types serialisables. En cas de doute, serialiser explicitement (`.toISOString()`, `Object.fromEntries()`, `Array.from()`).

### 3.3 Suspense et Streaming

Le streaming permet d'envoyer le HTML progressivement au navigateur. Chaque section de la page peut se charger independamment.

- `loading.tsx` = Suspense au niveau route (automatique, gere par Next.js)
- `<Suspense>` dans la page = streaming granulaire (manuel, recommande)

**Regles** :

- 1 `<Suspense>` par section de donnees independante.
- Chaque `<Suspense>` a un fallback skeleton dedie (pas un spinner generique).
- Ne jamais bloquer toute la page avec un seul `await` sequentiel.

```tsx
// BIEN -- Chargement parallele, chaque section independante
export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
      <Suspense fallback={<ProjectListSkeleton />}>
        <RecentProjects />
      </Suspense>
    </div>
  );
}

// MAL -- Un seul await bloque tout
export default async function DashboardPage() {
  const stats = await fetchStats();       // <- bloque
  const activity = await fetchActivity(); // <- attend le precedent
  const projects = await fetchProjects(); // <- attend les deux
  return <div>...</div>; // L'utilisateur ne voit rien pendant 3 fetches
}
```

**Anti-patterns Suspense** :

| Anti-pattern | Correction |
|---|---|
| Un seul `<Suspense>` qui englobe toute la page | Un `<Suspense>` par section independante |
| Spinner generique comme fallback | Skeleton dedie qui imite la mise en page finale |
| `await` sequentiels dans un Server Component | Composants async independants dans des `<Suspense>` separes |

### 3.4 Limites de taille

| Seuil | Action |
|---|---|
| < 150 lignes | Ideal. |
| 150-300 lignes | Acceptable si une seule responsabilite. |
| 300-500 lignes | Decomposer. Extraire hooks et sous-composants. |
| > 500 lignes | **Interdit.** Scinder obligatoirement. |

**Exception** : Un Provider complexe (player, auth) peut depasser 400 lignes s'il encapsule un SDK externe. Documenter pourquoi avec `// EXCEPTION:`.

### 3.5 Regles de decomposition

**Quand un composant fait 2+ choses, il doit etre scinde.**

```tsx
// MAL -- 500 lignes, 4 types de blocs dans un switch
function ContentBlock({ block }) {
  if (block.type === "text") { /* 150 lignes */ }
  if (block.type === "note") { /* 80 lignes */ }
  if (block.type === "separator") { /* 40 lignes */ }
  if (block.type === "media") { /* 120 lignes */ }
}

// BIEN -- Dispatcher + sous-composants dedies
function ContentBlock({ block, ...props }) {
  switch (block.type) {
    case "text": return <TextBlock block={block} {...props} />;
    case "note": return <NoteBlock block={block} {...props} />;
    case "separator": return <SeparatorBlock />;
    case "media": return <MediaBlock block={block} {...props} />;
  }
}
```

**Quand un formulaire apparait dans 2+ dialogs, extraire les champs.**

```tsx
// BIEN -- Composant de champs partage
function EntityFormFields({ values, onChange, categories }) {
  return (
    <>
      <LabeledInput label="Titre" value={values.title} ... />
      <LabeledInput label="Description" value={values.description} ... />
      <CategorySelect value={values.category} categories={categories} ... />
    </>
  );
}
// AddDialog et EditDialog utilisent <EntityFormFields />
```

### 3.6 Regles de props

**Max 7 props metier par composant.** Les props techniques (className, ref, aria-*) ne comptent pas. Au-dela, regrouper en objet ou repenser l'architecture.

```tsx
// MAL -- 11 props a plat
<ProjectCard
  title={p.title}
  author={p.author}
  status={p.status}
  type={p.type}
  category={p.category}
  createdAt={p.createdAt}
  onClick={() => open(p.id)}
  onEdit={() => edit(p)}
  onDelete={() => del(p.id)}
  onArchive={() => archive(p.id)}
  isAdmin={isAdmin}
/>

// BIEN -- Objet + callbacks groupes
<ProjectCard
  project={p}
  onClick={() => open(p.id)}
  actions={isAdmin ? { onEdit: () => edit(p), onDelete: () => del(p.id) } : undefined}
/>
```

### 3.7 useEffect -- Regles d'or

**useEffect est pour les side-effects REELS uniquement :**

- Subscriptions (WebSocket, EventListener, IntersectionObserver)
- Timers (setInterval, setTimeout)
- DOM direct (focus, scroll, inject CSS)
- Sync avec un systeme externe (localStorage, URL query params, SDK tiers)

**useEffect est INTERDIT pour :**

- Calculer un etat derive -> `useMemo`
- Transformer des props en state -> calcul inline ou `useMemo`
- Synchroniser 2 states React entre eux -> un seul state ou `useReducer`

```tsx
// MAL -- useEffect pour etat derive
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// BIEN -- Calcul inline
const fullName = `${firstName} ${lastName}`;

// BIEN (si couteux) -- useMemo
const filtered = useMemo(
  () => items.filter(i => i.name.includes(query)),
  [items, query],
);
```

### 3.8 Hooks customs -- Quand les creer

**Creer un hook custom quand :**

1. La meme combinaison `useState` + `useEffect` + `useCallback` apparait dans 2+ composants.
2. Un composant a 5+ hooks et la logique est extractible.
3. Un pattern (focus hover, scroll tracking, polling) est reutilisable.

**Nommage** : `use[Action][Contexte].ts`

```
use-focus-hover.ts        <- gestion du hover focus avec timer
use-section-tracking.ts   <- scroll -> section active pour TOC
use-dialog-state.ts       <- open/close + reset d'etat
```

---

## 4. State management

### 4.1 Zustand -- Conventions

**1 store = 1 domaine, 1 fichier.**

Utiliser `persist` **uniquement** si l'etat doit survivre a un refresh du navigateur.

| Etat | Persist ? |
|---|---|
| Vue active, theme, preferences utilisateur | Oui |
| Wizard / formulaire multi-etapes en cours | Non -- reset au refresh |
| Selection temporaire (checkbox, multi-select) | Non |
| Filtres de recherche | Selon UX (oui si l'utilisateur s'attend a retrouver ses filtres) |
| Drag-and-drop en cours | Non |

```typescript
// lib/stores/view-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewState {
  // --- State ---
  view: ViewType;
  activeItemId: string | null;
  // --- Actions ---
  setView: (view: ViewType) => void;
  openItem: (id: string) => void;
  closeItem: () => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      view: "list",
      activeItemId: null,
      setView: (view) => set({ view, activeItemId: null }),
      openItem: (id) => set({ activeItemId: id }),
      closeItem: () => set({ activeItemId: null }),
    }),
    { name: "app-view" },
  ),
);
```

**Regles** :

- Separer state et actions dans l'interface (`// --- State ---` / `// --- Actions ---`).
- Les actions qui changent la vue doivent reset les sous-etats (eviter les etats orphelins).
- Pas de logique metier async dans le store (pas d'appels DB). Les transformations async simples avec etats loading/error explicites sont tolerees.

### 4.2 Formulaires -- 3 niveaux de complexite

| Complexite | Cas d'usage | Approche |
|---|---|---|
| Simple (1-3 champs) | Recherche, filtre | `useState` individuels |
| Moyen (4-7 champs) | Formulaire CRUD | `useState` individuels ou objet unique |
| Complexe (8+ champs, validation) | Wizard, onboarding | `react-hook-form` + `Zod` |

**Regle** : Ne pas melanger `useState` et `react-hook-form` **pour gerer les memes champs de formulaire**. Un etat UI auxiliaire (`useState` pour un modal open, un tab actif, une progression d'upload) autour d'un formulaire `react-hook-form` est un pattern courant et correct.

```tsx
// BIEN -- RHF pour les champs + useState pour l'UI auxiliaire
"use client";
function CreateProjectForm() {
  const form = useForm<CreateProjectInput>({ resolver: zodResolver(schema) });
  const [showAdvanced, setShowAdvanced] = useState(false); // UI, pas un champ
  const [uploadProgress, setUploadProgress] = useState(0); // UI, pas un champ

  return (
    <Form {...form}>
      <FormField name="name" ... />
      <FormField name="description" ... />
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
        Options avancees
      </button>
      {showAdvanced && <FormField name="priority" ... />}
    </Form>
  );
}

// MAL -- useState pour un champ ET RHF pour un autre
function BadForm() {
  const [name, setName] = useState(""); // <- pourquoi pas dans RHF ?
  const form = useForm({ defaultValues: { description: "" } });
  // Incohérent : validation partielle, submit complexe
}
```

### 4.3 Remote State (server state cote client)

**Le probleme** : Zustand gere l'etat local/global. Les RSC gerent l'etat serveur au rendu initial. Mais entre les deux : quand une mutation Server Action invalide le cache serveur, l'etat client peut rester stale.

**Regle** : Choisir UN outil standard pour le server state cote client et l'utiliser partout.

| Approche | Quand l'utiliser |
|---|---|
| **RSC + `revalidatePath`** (Next.js natif) | Mutations simples, pages principalement serveur. Suffisant pour la majorite des cas. |
| **TanStack Query** | Polling, infinite scroll, optimistic updates complexes, pages tres interactives |
| **SWR** | Alternative plus legere a TanStack Query |
| **`useOptimistic`** (React 19) | Feedback instantane sur une mutation unique |

**Pattern : RSC natif (recommande par defaut)**

```tsx
// app/actions.ts
"use server";
export async function createProject(data: CreateProjectInput) {
  await db.insert("projects", data);
  revalidatePath("/projects"); // Invalide le cache serveur
}

// components/projects/CreateProjectButton.tsx
"use client";
function CreateProjectButton() {
  const [state, action, isPending] = useActionState(createProject, null);
  // Le revalidatePath dans l'action rafraichit automatiquement la page
  return <form action={action}>...</form>;
}
```

**Pattern : TanStack Query (quand necessaire)**

```tsx
// Hydratation initiale depuis RSC
// app/projects/page.tsx (Server Component)
export default async function ProjectsPage() {
  const projects = await fetchProjects();
  return <ProjectsList initialData={projects} />;
}

// components/projects/ProjectsList.tsx (Client Component)
"use client";
function ProjectsList({ initialData }: { initialData: Project[] }) {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjectsClient,
    initialData, // Hydrate depuis le RSC -- pas de flash
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  return <div>...</div>;
}
```

**Regle** : Ne pas melanger les approches dans une meme feature. Si une page utilise TanStack Query, toutes ses mutations passent par TanStack Query. Si une page utilise les Server Actions natives, elle reste sur ce pattern.

### 4.4 Etat local vs global

| Situation | Ou stocker |
|---|---|
| Etat d'un dialog (open/close) | `useState` local |
| Recherche/filtre dans une vue | `useState` local |
| Vue active, onglet selectionne | Zustand (persist) |
| Preferences utilisateur (theme, font) | Zustand (persist) |
| Donnees de formulaire en cours de saisie | `useState` ou `react-hook-form` local |
| Token d'auth, session | Context (Provider) |
| Donnees serveur (listes, details) | RSC, ou `useQuery` si pages tres interactives |

**Regle** : Si l'etat doit survivre a un changement de vue ou un refresh -> Zustand persist. Sinon -> local.

---

## 5. Backend / API

> Les exemples de cette section utilisent du pseudocode generique. Pour l'implementation concrete avec votre backend, voir `addon-[votre-backend].md`.

### 5.1 Template de mutation

Chaque fonction backend suit cet ordre obligatoire : **AUTH -> VALIDATION -> VERIFICATION -> OPERATION**.

```typescript
// Template universel d'une mutation backend
export async function createProject(ctx: AuthContext, input: CreateProjectInput) {
  // 1. AUTH -- toujours en premier
  const user = await requireAuth(ctx);
  await requirePermission(user, "projects.create", input.teamId);

  // 2. VALIDATION -- regles metier
  if (input.name.length > 200) {
    throw new AppError({ code: "VALIDATION", message: "Nom trop long (max 200 caracteres)" });
  }

  // 3. VERIFICATION -- existence des entites referencees
  const team = await db.findById("teams", input.teamId);
  if (!team) {
    throw new AppError({ code: "NOT_FOUND", message: "Equipe introuvable" });
  }

  // 4. OPERATION -- insertion/modification
  return await db.insert("projects", {
    ...input,
    createdAt: Date.now(),
  });
}
```

### 5.2 Erreurs structurees

Utiliser des codes d'erreur standardises :

| Code | Usage | Exemple |
|---|---|---|
| `NOT_FOUND` | Entite inexistante | "Projet introuvable" |
| `UNAUTHORIZED` | Non authentifie | "Session expiree" |
| `FORBIDDEN` | Authentifie mais pas autorise | "Acces refuse a cette equipe" |
| `VALIDATION` | Donnees invalides | "Nom trop long (max 200 caracteres)" |
| `CONFLICT` | Duplication, contrainte d'unicite, version mismatch | "Un projet avec ce nom existe deja" |
| `LIMIT_EXCEEDED` | Quota, taille max | "Limite de 10 projets atteinte" |

```typescript
// BIEN -- Erreur structuree avec code
throw new AppError({ code: "NOT_FOUND", message: "Projet introuvable" });

// MAL -- Erreur generique sans code
throw new Error("Projet introuvable");
```

**Pattern generique d'extraction de message d'erreur (frontend)** :

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erreur inattendue";
}
```

### 5.3 Pagination obligatoire

Toute query listant des donnees doit definir une `limit` et un `sort`. Interdit de retourner une liste non bornee.

**Deux strategies** :

| Strategie | Quand l'utiliser | Avantage |
|---|---|---|
| **Offset/Limit** | Petites collections (< 10k rows), navigation par page | Simple |
| **Cursor-based** | Grandes collections, infinite scroll, donnees qui changent souvent | Performant, pas de skip |

```typescript
// MAL -- Liste non bornee
async function listProjects() {
  return await db.findAll("projects"); // <- tout en memoire
}

// BIEN -- Paginee et bornee (offset)
async function listProjects(teamId: string, limit = 50) {
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);
  return await db.find("projects", {
    where: { teamId },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });
}

// BIEN -- Cursor-based (pour infinite scroll / grandes collections)
async function listProjects(teamId: string, cursor?: string, limit = 50) {
  const safeLimit = Math.min(limit, 100);
  return await db.find("projects", {
    where: { teamId, ...(cursor ? { id: { gt: cursor } } : {}) },
    orderBy: { id: "asc" },
    take: safeLimit + 1, // +1 pour savoir s'il y a une page suivante
  });
}
```

### 5.4 Helpers partages (DRY backend)

Tout pattern repete 3+ fois doit etre dans `helpers.ts`.

```typescript
/** Filtre les champs undefined pour un patch partiel. */
export function filterUndefined(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
```

### 5.5 Pas de duplication de mutation

**Regle absolue** : Une operation metier = UN seul endpoint.

```
MAL :
  users.ts  -> inviteUser()   <- validation complete
  admin.ts  -> inviteUser()   <- validation partielle
  -> Le frontend ne sait pas lequel appeler. Bug garanti.

BIEN :
  users.ts  -> inviteUser()   <- seule source
  admin.ts  -> (supprime ou appelle users en interne)
```

### 5.6 Routes API Next.js

**Regle** : Les routes API Next.js sont reservees aux integrations externes (webhooks, IA, OAuth callbacks). Elles ne remplacent PAS le backend principal.

Trois categories :

| Categorie | Auth | Exemple |
|---|---|---|
| **Privee** | Session utilisateur obligatoire | CRUD qui proxie le backend |
| **Webhook** | Verification de signature (pas de session) | Stripe, GitHub webhooks |
| **Publique** | Aucune (documenter explicitement) | Health check, status |

```typescript
// Exemple route API privee
export async function POST(request: Request) {
  // 1. AUTH
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Non authentifie" }, { status: 401 });
  }

  // 2. VALIDATION + OPERATION
  const body = await request.json();
  // ... logique
  return Response.json({ success: true });
}
```

### 5.7 Operations multi-etapes

**Principe** : Une operation qui touche plusieurs tables ou systemes externes n'est pas atomique. Anticiper l'echec partiel.

**Pattern : Transaction compensee**

1. Chaque etape critique a un etat intermediaire explicite (`status: "creating"`)
2. Chaque etape qui peut echouer a une compensation definie
3. Les etats intermediaires sont filtres des queries par defaut

```typescript
// Exemple : creation d'un workspace avec equipe
async function createWorkspace(ctx: AuthContext, input: CreateWorkspaceInput) {
  const user = await requireAuth(ctx);

  // Etape 1 : creer le workspace avec statut intermediaire
  const workspaceId = await db.insert("workspaces", {
    name: input.name,
    status: "creating", // <- filtre des queries de liste
    ownerId: user.id,
    createdAt: Date.now(),
  });

  try {
    // Etape 2 : creer l'equipe par defaut
    await db.insert("teams", {
      workspaceId,
      name: "General",
      createdAt: Date.now(),
    });

    // Etape 3 : activer le workspace
    await db.update("workspaces", workspaceId, { status: "active" });
  } catch (error) {
    // Compensation : supprimer le workspace si une etape echoue
    await db.delete("workspaces", workspaceId);
    throw error;
  }

  return workspaceId;
}
```

**Regle** : Les effets de bord non-critiques (emails, webhooks, analytics) passent par un scheduler ou une queue. L'operation principale retourne immediatement.

> Pour l'implementation concrete du scheduler/queue, voir `addon-[votre-backend].md`.

**Anti-patterns** :

| Anti-pattern | Correction |
|---|---|
| Envoi d'email bloquant dans une mutation | Scheduler/queue asynchrone |
| Pas de compensation en cas d'echec partiel | Definir une strategie de rollback par etape |
| Etats intermediaires visibles dans les listes | Filtrer `status != "creating"` par defaut |

---

## 6. Next.js Patterns

### 6.1 Caching et Revalidation

**Changement critique (Next.js 15+)** : `fetch()` dans les Server Components n'est **plus cache par defaut**. C'est un changement majeur par rapport a Next.js 14.

**Strategies de revalidation** :

- `revalidatePath(path)` : revalide une route specifique
- `revalidateTag(tag)` : revalide tous les fetches tagges avec cette cle
- Pattern : apres toute mutation -> revalidation explicite

**Table de decision** :

| Type de route | Strategie de cache |
|---|---|
| Marketing / contenu statique | ISR avec revalidate (ex: 3600s) |
| Dashboard / donnees utilisateur | Pas de cache ou TTL court |
| Donnees specifiques a l'utilisateur | `dynamic = "force-dynamic"` |
| Donnees partagees rarement modifiees | `unstable_cache` avec tag |

```tsx
// BIEN -- Mutation + revalidation explicite
"use server";
import { revalidatePath } from "next/cache";

export async function updateProjectName(projectId: string, name: string) {
  await db.update("projects", projectId, { name });
  revalidatePath("/projects");       // revalide la liste
  revalidatePath(`/projects/${projectId}`); // revalide le detail
}

// BIEN -- Fetch avec revalidation periodique (contenu statique)
const posts = await fetch("https://api.example.com/posts", {
  next: { revalidate: 3600, tags: ["posts"] },
});
```

**Anti-patterns** :

| Anti-pattern | Correction |
|---|---|
| Donnees stale apres mutation (pas de revalidation) | `revalidatePath` ou `revalidateTag` apres chaque mutation |
| Tout cacher par defaut | Cacher uniquement ce qui change rarement |
| Compter sur le cache automatique de Next.js 14 | Explicitement configurer le cache en Next.js 15+ |

### 6.2 Server Actions

**Definition** : Fonction marquee `"use server"`, appelable depuis un composant client. Les Server Actions sont des **endpoints publics** -- toujours valider et authentifier.

**Quand utiliser** : mutations simples, soumissions de formulaire, operations qui necessitent une revalidation.

**Quand NE PAS utiliser** : logique metier complexe -> backend dedie.

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  teamId: z.string(),
});

export async function createProject(formData: FormData) {
  // 1. AUTH
  const session = await getSession();
  if (!session) throw new Error("Non authentifie");

  // 2. VALIDATION
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    teamId: formData.get("teamId"),
  });
  if (!parsed.success) throw new Error("Donnees invalides");

  // 3. OPERATION
  await db.insert("projects", { ...parsed.data, createdAt: Date.now() });

  // 4. REVALIDATION
  revalidatePath("/projects");
}
```

**Formulaires progressifs avec useActionState** :

```tsx
"use client";
import { useActionState } from "react";
import { createProject } from "@/app/actions";

function CreateProjectForm() {
  const [state, action, isPending] = useActionState(createProject, null);

  return (
    <form action={action}>
      <input name="name" required />
      <input name="teamId" type="hidden" value="team-1" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creation..." : "Creer le projet"}
      </button>
      {state?.error && <p className="text-destructive">{state.error}</p>}
    </form>
  );
}
```

**Regle** : Si la logique metier depasse 50 lignes, elle appartient au backend dedie, pas a une Server Action.

**Anti-patterns** :

| Anti-pattern | Correction |
|---|---|
| Server Action > 50 lignes de logique | Extraire vers le backend dedie |
| Server Action sans validation | Toujours valider avec Zod |
| Server Action sans auth check | Toujours verifier la session |

### 6.3 Middleware

**Role** : decisions de routage (auth redirects, i18n, feature flags) et validation legere de session.

**Ce que le middleware PEUT faire** :

- Verifier la presence ET la validite d'un token/cookie (signature, expiration)
- Requeter un store leger (Redis, KV edge-compatible) pour valider une session opaque
- Redirections basees sur le role ou la locale
- Ajouter des headers (correlation ID, CSP)

**Ce que le middleware NE DOIT PAS faire** :

- Requetes lourdes (jointures SQL, aggregations)
- Logique metier (calculs, transformations de donnees)
- Appels a des APIs externes lentes

**Convention** : un seul fichier `middleware.ts` a la racine du projet avec un `matcher` configure.

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session-token")?.value;

  // Verifier la PRESENCE et la VALIDITE du token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verification legere : signature + expiration
  // (Pour sessions opaques : lookup KV/Redis edge-compatible)
  const session = await verifySessionToken(token);
  if (!session || session.expiresAt < Date.now()) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session-token");
    return response;
  }

  // Propager le correlation ID (voir §19 Observabilite)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-correlation-id",
    request.headers.get("x-correlation-id") ?? crypto.randomUUID()
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Proteger toutes les routes sauf auth, api, assets
    "/((?!login|signup|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

**Relation middleware / layout** : Le middleware protege les routes (redirections). Le layout fournit le contexte (donnees utilisateur, providers).

### 6.4 Conventions fichiers App Router

| Fichier | Role | Obligatoire ? |
|---|---|---|
| `page.tsx` | Contenu de la route | Oui (sinon pas de route) |
| `layout.tsx` | Wrapper persistant (ne re-render pas a la navigation) | Root: oui. Sous-routes: selon besoin |
| `loading.tsx` | Fallback Suspense au niveau route | Oui si fetch async |
| `error.tsx` | Error boundary de la route | Oui si fetch async |
| `not-found.tsx` | Fallback 404 | Recommande sur les routes dynamiques |
| `template.tsx` | Comme layout mais re-render a chaque navigation | Rarement necessaire |
| `default.tsx` | Fallback pour les routes paralleles | Seulement avec routes paralleles |

**Route groups** : Utiliser les parentheses `(auth)`, `(app)` pour grouper logiquement les routes sans creer de segment d'URL. Cela permet de partager des layouts et des strategies d'auth entre routes sans affecter la structure d'URL.

### 6.5 Edge vs Node Runtime

| Runtime | Quand | Limites |
|---|---|---|
| **Edge** (par defaut pour middleware) | Redirections, headers, verifications legeres | Pas de `fs`, pas de Node APIs, taille limitee |
| **Node** (par defaut pour routes/pages) | Logique metier, DB lourde, APIs Node | Latence plus elevee (cold start) |

**Regle** : Ne pas forcer `runtime = "edge"` sur des routes qui ont besoin d'APIs Node. Le middleware tourne toujours en Edge.

---

## 7. TypeScript

### 7.1 Les 5 commandements TypeScript

```
1. Zero `any`.            → `unknown` + type guard si le type est inconnu.
2. Zero `as` par defaut.  → Exceptions autorisees pour SDK externes et events DOM
                            non couverts par les generiques React,
                            avec commentaire `// EXCEPTION-TYPECAST: [raison]`.
                            Preferer `satisfies` quand possible.
3. Interfaces explicites  → Toute props de composant a une interface nommee.
4. Types generes          → Utiliser les types generes par votre ORM/backend.
                            Ne jamais redefinir manuellement un type qui existe deja.
5. Union discriminee      → Pour les variantes. `never` obligatoire dans les switch exhaustifs.
```

### 7.2 Exemples

```tsx
// MAL — `any` et `as` injustifie
const y = (item as any).transform?.[5];

// BIEN — Type guard
interface PdfTextItem { str: string; transform: number[] }
function isPdfTextItem(item: unknown): item is PdfTextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

// BIEN — Exception documentee pour un querySelector non-type
// EXCEPTION-TYPECAST: querySelector retourne Element | null, on sait que c'est un input
const input = document.querySelector("#search") as HTMLInputElement;

// INUTILE — Cast redondant sur un event deja type par le generique React
function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  // PAS BESOIN de cast : e.target est deja type HTMLInputElement
  const value = e.target.value; // <- correct, pas de `as` necessaire
}

// BIEN — `satisfies` pour verifier un type sans elargir
const config = {
  theme: "dark",
  locale: "fr",
} satisfies AppConfig;

// BIEN — switch exhaustif avec never
function getStatusLabel(status: "active" | "archived" | "draft"): string {
  switch (status) {
    case "active": return "Actif";
    case "archived": return "Archive";
    case "draft": return "Brouillon";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

### 7.3 `satisfies` vs `as const`

| Outil | Usage | Effet |
|---|---|---|
| `satisfies T` | Verifier qu'une valeur est compatible avec `T` sans elargir le type | Le type infere reste precis |
| `as const` | Figer une valeur en type literal (readonly) | Permet d'en deriver un union type |
| `as T` | Forcer un type (cast) | Dangereux — masque les erreurs |

```typescript
// as const — Constante + type derive
export const VALID_STATUSES = ["active", "archived", "draft"] as const;
export type Status = (typeof VALID_STATUSES)[number]; // "active" | "archived" | "draft"

// satisfies — Verifier sans elargir
const routes = {
  home: "/",
  dashboard: "/dashboard",
  settings: "/settings",
} satisfies Record<string, string>;
// typeof routes.home = "/" (literal), pas string
```

### 7.4 Imports et resolution de chemins

**Principe** : Les imports lisibles et coherents reduisent la charge cognitive et facilitent les refactorings. L'outillage enforce ce qui ne devrait pas reposer sur la discipline.

**Regles** :

**Path aliases obligatoires.** Imports relatifs au-dela de 1 niveau interdits.

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

```typescript
// MAL
import { cn } from "../../../lib/utils";

// BIEN
import { cn } from "@/lib/utils";
```

**Ordre des imports** (6 groupes avec saut de ligne entre chaque) :

```typescript
// 1. React / Next.js
import { useState, useCallback } from "react";
import Image from "next/image";

// 2. Librairies tierces
import { z } from "zod";
import { toast } from "sonner";

// 3. Backend / API (adapter selon le backend)
import { listProjects, createProject } from "@/backend/projects";

// 4. Composants internes
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";

// 5. Hooks, stores, utils
import { useViewStore } from "@/lib/stores/view-store";
import { cn } from "@/lib/utils";

// 6. Types (import type)
import type { Project } from "@/types/project";
```

**Enforcement** : Enforcer l'ordre avec un plugin ESLint (`eslint-plugin-import-x` ou le tri automatique de Biome). La discipline seule ne suffit pas.

**Barrel exports (`index.ts`) deconseilles** sauf `components/ui/` et `lib/hooks/`. Raisons : complexite de resolution des modules, risques de dependances circulaires, et ralentissement du bundler sur les gros projets. Les bundlers modernes avec `"sideEffects": false` gerent le tree-shaking, mais la DX (auto-imports, navigation IDE, temps de resolution) reste degradee.

```typescript
// DECONSEILLE — barrel export dans components/projects/index.ts
export { ProjectCard } from "./ProjectCard";
export { ProjectList } from "./ProjectList";
export { ProjectForm } from "./ProjectForm";

// BIEN — import direct du fichier source
import { ProjectCard } from "@/components/projects/ProjectCard";
```

---

## 8. Contrats API & Serialisation

### 8.1 Probleme

Un dev backend renomme `teamId` en `team_id`. Le frontend casse en prod sans test ni type partage pour le detecter. Separement : un dev passe une `Map` en prop d'un Server Component vers un Client Component — erreur runtime cryptique.

**Regle** : Definir une **source de verite unique** pour les types echanges entre frontend et backend.

### 8.2 Source de verite des types

| Approche | Quand l'utiliser |
|---|---|
| **Schemas Zod partages** (`lib/schemas/`) | Backend custom (Server Actions, Route Handlers). Recommande par defaut. |
| **tRPC** | Quand le backend est en TypeScript et qu'on veut du type-safe end-to-end |
| **Types generes par l'ORM** (`Doc<>`, Prisma types) | Quand l'ORM genere des types fiables. Couche Zod en facade pour la validation. |
| **OpenAPI genere** | API REST externe avec contrat formel |

**Pattern : Schemas Zod partages (recommande)**

```typescript
// lib/schemas/project.ts — Source de verite
import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  teamId: z.string(),
  status: z.enum(["active", "archived", "draft"]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const createProjectSchema = projectSchema.pick({
  name: true,
  teamId: true,
});

export const updateProjectSchema = projectSchema.partial().pick({
  name: true,
  status: true,
});

// Types derives — jamais definis manuellement
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

```typescript
// backend/projects.ts — Utilise le schema partage
import { createProjectSchema } from "@/lib/schemas/project";

export async function createProject(ctx: AuthContext, input: unknown) {
  const user = await requireAuth(ctx);
  const parsed = createProjectSchema.parse(input); // Validation runtime
  // ...
}
```

```tsx
// components/projects/CreateProjectForm.tsx — Meme schema
import { createProjectSchema } from "@/lib/schemas/project";

const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
});
```

**Regle** : Le schema Zod est defini UNE SEULE FOIS dans `lib/schemas/`. Le backend et le frontend importent le meme schema. Si le backend renomme un champ, le type change partout et TypeScript detecte les erreurs a la compilation.

### 8.3 Validation des reponses externes

Toute reponse d'une API externe (pas sous votre controle) doit etre validee a la reception.

```typescript
// MAL — Faire confiance a l'API externe
const res = await fetch("https://api.external.com/data");
const data = await res.json(); // <- any implicite, pas de validation

// BIEN — Valider avec un schema
const externalDataSchema = z.object({
  items: z.array(z.object({ id: z.string(), name: z.string() })),
  total: z.number(),
});

const res = await fetch("https://api.external.com/data");
if (!res.ok) throw new Error(`API externe echouee (${res.status})`);
const raw = await res.json();
const data = externalDataSchema.parse(raw); // Validation runtime
```

### 8.4 Contract tests

**Regle** : Tout schema partage entre frontend et backend doit avoir un contract test en CI.

```typescript
// lib/schemas/__tests__/project.contract.test.ts
import { describe, it, expect } from "vitest";
import { projectSchema, createProjectSchema } from "../project";

describe("Project contract", () => {
  it("valide un projet complet", () => {
    const result = projectSchema.safeParse({
      id: "proj_123",
      name: "Mon projet",
      teamId: "team_456",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("rejette un projet sans nom", () => {
    const result = createProjectSchema.safeParse({ teamId: "team_456" });
    expect(result.success).toBe(false);
  });

  it("rejette un status invalide", () => {
    const result = projectSchema.safeParse({
      id: "proj_123",
      name: "Test",
      teamId: "team_456",
      status: "invalid",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });
});
```

---

## 9. Securite

### 9.1 Session & Authentification

**Principe** : Verifier la **presence** d'un cookie ne suffit pas. Il faut verifier sa **validite** (signature, expiration, revocation).

**Cookie flags obligatoires** :

| Flag | Valeur | Raison |
|---|---|---|
| `httpOnly` | `true` | Empeche l'acces JavaScript (protection XSS) |
| `secure` | `true` (prod) | Cookie envoye uniquement sur HTTPS |
| `sameSite` | `lax` (ou `strict`) | Protection CSRF de base |
| `path` | `/` | Scope du cookie |
| `maxAge` ou `expires` | Selon besoin | Expiration explicite |

```typescript
// BIEN — Cookie de session avec flags securises
import { cookies } from "next/headers";

export function setSessionCookie(token: string) {
  cookies().set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}
```

**Validation de session** :

```
BIEN (§6.3 middleware corrige) :
  1. Lire le cookie
  2. Verifier la signature (JWT) ou lookup session (KV/Redis)
  3. Verifier l'expiration
  4. Rejeter si invalide

MAL (V4 §6.3) :
  1. Verifier que le cookie existe  <- un cookie forge/expire passe
```

**Rotation de session** : Apres un login, un changement de mot de passe, ou une elevation de privilege, generer un nouveau token de session et invalider l'ancien.

### 9.2 Protection CSRF

**Quand** : Toute mutation basee sur un cookie de session (POST, PUT, DELETE).

**Strategies** :

| Strategie | Implementation |
|---|---|
| **`sameSite: lax`** sur le cookie | Protection de base (bloque les requetes cross-origin POST) |
| **Double Submit Cookie** | Envoyer un token CSRF dans un header + dans un cookie, comparer cote serveur |
| **Token lie a la session** | Generer un token CSRF unique par session, valider a chaque mutation |

**Regle** : `sameSite: lax` est le minimum. Pour les mutations sensibles (paiement, changement de mot de passe), ajouter un token CSRF explicite.

> Les frameworks d'auth (NextAuth, Clerk, Lucia) gerent souvent le CSRF automatiquement. Verifier la documentation de votre solution.

### 9.3 Autorisation : deny by default

**Principe RBAC/ABAC** : Toute route, toute query, toute mutation est **refusee par defaut**. L'acces doit etre explicitement accorde.

```typescript
// BIEN — Helper d'autorisation centralise
type Permission = "projects.create" | "projects.read" | "projects.update" | "projects.delete";

async function requirePermission(
  user: AuthUser,
  permission: Permission,
  resourceOwnerId?: string,
) {
  // Admin : tout autorise
  if (user.role === "admin") return;

  // Owner : autorise sur ses propres ressources
  if (resourceOwnerId && user.id === resourceOwnerId) return;

  // Sinon : refuse
  throw new AppError({ code: "FORBIDDEN", message: "Acces refuse" });
}

// Usage dans une mutation
export async function deleteProject(ctx: AuthContext, projectId: string) {
  const user = await requireAuth(ctx);
  const project = await db.findById("projects", projectId);
  if (!project) throw new AppError({ code: "NOT_FOUND", message: "Projet introuvable" });

  await requirePermission(user, "projects.delete", project.ownerId);
  // ...
}
```

### 9.4 Checklist securite

- [ ] **Toute query/mutation backend** qui accede a des donnees scopees — auth + scope check.
- [ ] **Toute route API Next.js** — auth check OU documentation explicite si publique.
- [ ] **Tout `fetch()` d'upload** — verifier `res.ok`.
- [ ] **Tout champ texte libre** — limite de taille serveur-side.
- [ ] **Tout `dangerouslySetInnerHTML`** — `DOMPurify.sanitize()`.
- [ ] **Tout redirect** — valider : `/^\/(?!\/)/` (commence par `/`, pas par `//`).
- [ ] **Pas de secrets dans le code** — `.env` + `.gitignore`.
- [ ] **Variables `NEXT_PUBLIC_`** — ne contiennent JAMAIS de secrets (exposees au client).
- [ ] **Headers securite** — CSP, HSTS, X-Frame-Options configures dans `next.config.js`.
- [ ] **Cookies de session** — `httpOnly`, `secure`, `sameSite: lax` minimum.
- [ ] **CSRF** — `sameSite: lax` minimum + token explicite pour mutations sensibles.
- [ ] **CORS** — Configurer `allowedOrigins` explicitement. Jamais `*` en prod.
- [ ] **Upload fichier** — Verifier MIME type (magic bytes, pas juste l'extension) + taille max serveur-side.
- [ ] **SSRF** — Valider les URLs fournies par l'utilisateur avant de les fetch cote serveur.

### 9.5 Limites de taille recommandees

| Type de champ | Limite |
|---|---|
| Nom, titre, label | 200 caracteres |
| Description, bio | 2 000 caracteres |
| Contenu markdown | 500 000 caracteres |
| Email | 320 caracteres |
| Texte envoye a une API IA | 100 000 caracteres |
| Tableau (array de strings) | 50 elements max |
| Upload fichier | Verifier MIME type + taille max serveur-side |

### 9.6 Validation en couches

```
Couche 1 — Client (UX)      : Zod schema dans le formulaire (feedback instantane)
Couche 2 — Backend (securite): Validators natifs du backend + checks dans le handler
Couche 3 — DB (integrite)   : Schema DB = source de verite des types
```

**Regle** : Ne JAMAIS faire confiance au client. Toute validation client doit etre repliquee cote serveur.

> Voir addon-[votre-backend].md pour la syntaxe des validators backend.

### 9.7 Rate limiting

**Principe** : Tout endpoint accessible sans authentification doit etre rate-limite. Le rate limiting protege contre les abus, le scraping et les attaques par force brute.

**Seuils recommandes** :

| Operation | Limite | Fenetre |
|---|---|---|
| Login / auth | 5 req/min/IP | 1 minute |
| Signup | 3 req/min/IP | 1 minute |
| API publique | 60 req/min/IP | 1 minute |
| Upload fichier | 10 req/min/user | 1 minute |
| Appel API IA (couteux) | 10 req/min/user | 1 minute |

**Implementation recommandee** : Service externe (Upstash, Redis, ou solution native du backend). Voir addon-[votre-backend].md pour l'implementation concrete.

**Anti-patterns** :
- Rate limiting uniquement cote client (contournable avec curl/Postman)
- Rate limiter in-memory en serverless (perd l'etat a chaque cold start — chaque instance a son propre compteur)

---

## 10. Gestion d'erreurs

### 10.1 Backend — Erreur structuree avec code

**Principe** : Toute erreur backend doit etre structuree avec un code machine exploitable par le frontend. Ne jamais lancer un `Error` generique.

```typescript
// MAL
throw new Error("Projet introuvable");

// BIEN — Erreur structuree avec code standardise
throw new AppError({ code: "NOT_FOUND", message: "Projet introuvable" });
```

> Voir addon-[votre-backend].md pour la classe d'erreur concrete (ConvexError, PostgrestError, etc.).

**Taxonomie d'erreurs** :

| Code | Usage |
|---|---|
| `NOT_FOUND` | Entite inexistante |
| `UNAUTHORIZED` | Non authentifie |
| `FORBIDDEN` | Authentifie mais pas autorise |
| `VALIDATION` | Donnees invalides |
| `CONFLICT` | Duplication, contrainte d'unicite, version mismatch (optimistic locking) |
| `LIMIT_EXCEEDED` | Quota, taille max |
| `INTERNAL` | Erreur inattendue (log + message generique) |

### 10.2 Frontend — try/catch + toast systematique

**Regle** : Toute mutation CRUD doit avoir un try/catch avec feedback visuel.

```tsx
import { toast } from "sonner";

const handleSave = async () => {
  if (!title.trim()) return;
  setSaving(true);
  try {
    await createProject({ name: title, teamId });
    toast.success("Projet cree");
    onClose();
  } catch (e) {
    const message = extractErrorMessage(e);
    toast.error(message ?? "Erreur inattendue");
  } finally {
    setSaving(false);
  }
};
```

> La fonction `extractErrorMessage(e)` depend du backend. Voir addon-[votre-backend].md pour l'implementation.

**Template du pattern** :

```
1. Guard (validation locale)     → return early
2. Set loading state             → setLoading(true)
3. try { mutation + toast.success + close/reset }
4. catch { toast.error }
5. finally { setLoading(false) }
```

### 10.3 Mapping erreurs API vers champs de formulaire

Quand l'API retourne une erreur de validation specifique a un champ, l'afficher au bon endroit.

```tsx
// Pattern : erreurs par champ avec react-hook-form
const onSubmit = async (data: CreateProjectInput) => {
  try {
    await createProject(data);
    toast.success("Projet cree");
  } catch (e) {
    if (isValidationError(e) && e.fieldErrors) {
      // Mapper les erreurs API vers les champs RHF
      for (const [field, message] of Object.entries(e.fieldErrors)) {
        form.setError(field as keyof CreateProjectInput, { message });
      }
    } else {
      toast.error(extractErrorMessage(e));
    }
  }
};
```

```tsx
// Accessibilite : aria-invalid + aria-describedby sur les champs en erreur
<input
  {...form.register("name")}
  aria-invalid={!!form.formState.errors.name}
  aria-describedby={form.formState.errors.name ? "name-error" : undefined}
/>
{form.formState.errors.name && (
  <p id="name-error" role="alert" className="text-destructive text-sm">
    {form.formState.errors.name.message}
  </p>
)}
```

### 10.4 Error Boundaries — Obligatoires

Chaque route avec fetch asynchrone doit avoir :
- `loading.tsx` — affichage pendant le chargement
- `error.tsx` — fallback en cas d'erreur

```tsx
// app/(app)/projects/error.tsx
"use client";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>Une erreur est survenue</h2>
      <button onClick={reset}>Reessayer</button>
    </div>
  );
}
```

### 10.5 Fetch externe — Verifier res.ok

```typescript
// MAL
const res = await fetch(url, { method: "POST", body });
const data = await res.json(); // explose si 500

// BIEN
const res = await fetch(url, { method: "POST", body });
if (!res.ok) {
  throw new Error(`Requete echouee (${res.status})`);
}
const data = await res.json();
```

### 10.6 Etats de chargement

**Principe** : Chaque type de contenu a son propre skeleton. Pas de spinner generique plein ecran.

**Pattern skeleton par domaine** : chaque type d'entite a son skeleton component dedie.

```tsx
// components/projects/ProjectCardSkeleton.tsx
export function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="h-5 w-2/3 rounded bg-muted" />
      <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
      <div className="mt-4 h-8 w-full rounded bg-muted" />
    </div>
  );
}
```

**Table de decision** :

| Situation | Pattern |
|---|---|
| Chargement initial de page | `loading.tsx` (Suspense route-level) |
| Section independante dans une page | `<Suspense fallback={<Skeleton />}>` |
| Mutation en cours | `setSaving(true)` + bouton disabled |
| Transition entre vues/tabs | `useTransition` + opacity |
| Chargement page suivante (pagination) | Skeleton inline ou spinner en bas de liste |

**Anti-pattern** : Spinner plein ecran pour une operation locale (changement d'onglet, ouverture de dialog). Utiliser un indicateur local (opacity, skeleton partiel).

---

## 11. Idempotence & Concurrence

### 11.1 Le probleme

Double-clic sur "Payer", retry reseau automatique → double facturation. Deux users editent le meme document → Lost Update silencieux.

### 11.2 Idempotency keys

**Regle** : Toute mutation non naturellement idempotente (creation, paiement, envoi d'email) doit supporter une cle d'idempotence.

```typescript
// Backend — Support idempotency key
export async function createPayment(
  ctx: AuthContext,
  input: CreatePaymentInput,
  idempotencyKey: string,
) {
  const user = await requireAuth(ctx);

  // Verifier si cette cle a deja ete utilisee
  const existing = await db.findOne("idempotency_keys", {
    key: idempotencyKey,
    userId: user.id,
  });

  if (existing) {
    // Retourner le resultat precedent sans re-executer
    return existing.result;
  }

  // Executer la mutation
  const result = await db.insert("payments", { ...input, userId: user.id });

  // Sauvegarder la cle d'idempotence (TTL 24h)
  await db.insert("idempotency_keys", {
    key: idempotencyKey,
    userId: user.id,
    result: { paymentId: result.id },
    createdAt: Date.now(),
  });

  return result;
}
```

```tsx
// Frontend — Generer la cle au montage, pas au clic
"use client";
function PaymentButton({ amount }: { amount: number }) {
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const [isPending, setIsPending] = useState(false);

  const handlePay = async () => {
    setIsPending(true);
    try {
      await createPayment({ amount }, idempotencyKey);
      toast.success("Paiement effectue");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={isPending}>
      {isPending ? "Paiement..." : `Payer ${amount}€`}
    </button>
  );
}
```

**Quand** :

| Mutation | Idempotence naturelle ? | Cle necessaire ? |
|---|---|---|
| `updateProject(id, { name })` | Oui (meme resultat si repete) | Non |
| `createProject({ name })` | Non (cree un doublon) | Oui |
| `processPayment({ amount })` | Non (double facturation) | Oui |
| `deleteProject(id)` | Oui (deja supprime = no-op) | Non |
| `sendInviteEmail(email)` | Non (double email) | Oui |

### 11.3 Optimistic Locking

**Regle** : Quand plusieurs utilisateurs peuvent modifier la meme entite, utiliser un champ `version` (ou `updatedAt`) pour detecter les conflits.

```typescript
// Backend — Optimistic locking avec version
export async function updateProject(
  ctx: AuthContext,
  projectId: string,
  input: UpdateProjectInput & { expectedVersion: number },
) {
  const user = await requireAuth(ctx);
  const project = await db.findById("projects", projectId);

  if (!project) {
    throw new AppError({ code: "NOT_FOUND", message: "Projet introuvable" });
  }

  // Verifier la version
  if (project.version !== input.expectedVersion) {
    throw new AppError({
      code: "CONFLICT",
      message: "Ce projet a ete modifie par quelqu'un d'autre. Rechargez et reessayez.",
    });
  }

  return await db.update("projects", projectId, {
    ...filterUndefined(input),
    version: project.version + 1,
    updatedAt: Date.now(),
  });
}
```

```tsx
// Frontend — Gerer le conflit
const handleSave = async () => {
  try {
    await updateProject(projectId, { name: newName, expectedVersion: project.version });
    toast.success("Projet mis a jour");
  } catch (e) {
    if (isConflictError(e)) {
      toast.error("Modifie par quelqu'un d'autre. Rechargez la page.", {
        action: { label: "Recharger", onClick: () => window.location.reload() },
      });
    } else {
      toast.error(extractErrorMessage(e));
    }
  }
};
```

### 11.4 Contraintes DB comme filet de securite

**Regle** : Les contraintes d'unicite en base de donnees sont le dernier filet. Meme si le code applicatif verifie les doublons, la contrainte DB protege contre les race conditions.

```typescript
// La verification applicative ne suffit PAS (race condition possible)
const existing = await db.findOne("projects", { name: input.name, teamId: input.teamId });
if (existing) throw new AppError({ code: "CONFLICT", message: "Nom deja pris" });
// <- Un autre request peut inserer entre le check et l'insert

// La contrainte DB est le filet de securite
// Schema DB : UNIQUE(name, teamId)
// -> Si race condition, la DB rejette avec une erreur d'unicite
// -> Catcher l'erreur DB et la transformer en CONFLICT
```

### 11.5 Retry cote client

**Pattern** : retry avec backoff exponentiel pour les erreurs reseau, PAS pour les erreurs metier.

```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 500 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Ne PAS retry les erreurs metier (4xx)
      if (error instanceof AppError) throw error;

      // Dernier essai : propager l'erreur
      if (attempt === maxRetries) throw error;

      // Backoff exponentiel avec jitter
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}
```

---

## 12. Performance

### 12.1 Budget performance

| Metrique | Cible |
|---|---|
| JS total par page critique | < 250KB gzip |
| LCP (Largest Contentful Paint) | < 2.5s mobile |
| Requetes au chargement initial | < 5 |

### 12.2 Regles React

```tsx
// useMemo — Pour les calculs couteux (filtrage, tri, parsing)
const filtered = useMemo(
  () => items.filter(i => i.name.includes(query)),
  [items, query],
);

// useCallback — Pour les handlers passes en props a des composants memoises
const handleClick = useCallback((id: string) => {
  router.push(`/item/${id}`);
}, [router]);

// NE PAS memoiser — Les calculs triviaux
const fullName = `${first} ${last}`; // pas besoin de useMemo
```

### 12.3 Queries conditionnelles

**Regle** : Tout dialog/sheet avec une query doit conditionner le fetch sur l'ouverture.

```tsx
// MAL — Query executee meme quand le dialog est ferme
const data = useQuery(fetchItems);

// BIEN — Query uniquement quand le dialog est ouvert
const data = useQuery(open ? fetchItems : null);
```

> Conditionner les queries sur l'etat d'ouverture du dialog. La syntaxe exacte depend du backend (`"skip"`, `enabled: false`, `null`, etc.). Voir addon-[votre-backend].md.

### 12.4 next/image

**Regle** : Toute image visible utilise `<Image>` de `next/image`. Ne jamais utiliser `<img>` directement.

```tsx
import Image from "next/image";

// BIEN — next/image avec dimensions
<Image
  src={project.coverUrl}
  alt={project.title}
  width={400}
  height={300}
  className="rounded-lg object-cover"
/>

// BIEN — Image LCP (hero, above the fold)
<Image
  src="/hero-banner.webp"
  alt="Banniere principale"
  width={1200}
  height={600}
  priority={true}
/>
```

**Anti-patterns** :
- `<img>` sans dimensions explicites (provoque du CLS — Cumulative Layout Shift)
- `priority={true}` sur toutes les images (annule l'optimisation — seule l'image LCP doit etre prioritaire)

### 12.5 Dynamic imports

**Principe** : Les composants lourds et les librairies pesantes (> 50KB) doivent etre importes dynamiquement pour ne pas alourdir le bundle initial.

```tsx
import dynamic from "next/dynamic";

// BIEN — Chargement paresseux d'un composant lourd
const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });
const ChartDashboard = dynamic(() => import("./ChartDashboard"), {
  loading: () => <ChartSkeleton />,
});
```

**Quand utiliser** : editeurs riches, viewers PDF, librairies de graphiques, composants avec dependances lourdes.

**Anti-pattern** : Import statique de librairies > 50KB (`pdfjs-dist`, `chart.js`, `marked`, `highlight.js`). Utiliser `import()` dynamique.

### 12.6 Performance serveur

**N+1 queries** : Ne jamais fetcher dans une boucle `.map()`.

```typescript
// MAL — N+1 queries
const projects = await listProjects(teamId);
const projectsWithOwners = await Promise.all(
  projects.map(async (p) => ({
    ...p,
    owner: await fetchUser(p.ownerId), // 1 query par projet
  })),
);

// BIEN — Batch fetch
const projects = await listProjects(teamId);
const ownerIds = [...new Set(projects.map(p => p.ownerId))];
const owners = await fetchUsersByIds(ownerIds); // 1 seule query
const ownerMap = new Map(owners.map(o => [o.id, o]));
const projectsWithOwners = projects.map(p => ({
  ...p,
  owner: ownerMap.get(p.ownerId),
}));
```

**Bundle analysis** : Verifier regulierement la taille du bundle en CI.

```bash
# Ajouter dans le script CI
npx next build
npx @next/bundle-analyzer  # ou analyser .next/analyze/
```

### 12.7 Anti-patterns performance

```
INTERDIT :
- Query dans un dialog ferme sans condition sur l'ouverture
- Promise.all sans limite sur un tableau de taille inconnue
- Fetch dans une boucle .map() (N+1 queries) → batch ou Promise.all borne
- Event listener scroll sans { passive: true }
- Re-render d'un arbre entier pour un changement local
- Import statique de librairies lourdes (pdfjs, marked) → import()
- <img> au lieu de <Image> de next/image
```

---

## 13. Accessibilite (a11y)

L'accessibilite n'est pas une option. C'est une exigence legale et ethique. Ces regles s'appliquent a **chaque composant**, pas en fin de projet.

### 13.1 Les 5 regles non-negociables

| Regle | Implementation |
|---|---|
| **Navigation clavier** | Tout element interactif est atteignable et activable au clavier (Tab, Enter, Escape) |
| **Labels explicites** | Tout `<input>` a un `<label>` associe ou un `aria-label`. Zero input orphelin. |
| **Texte alternatif** | Toute `<img>` a un `alt` descriptif ou `alt=""` si decorative |
| **Contraste suffisant** | WCAG AA minimum : ratio 4.5:1 pour le texte, 3:1 pour les grands textes |
| **Focus visible** | `:focus-visible` style sur tous les elements interactifs. Ne JAMAIS `outline: none` sans alternative. |

### 13.2 Regles supplementaires

```tsx
// BIEN — Button avec type explicite (evite submit accidentel)
<button type="button" onClick={handleClick}>Annuler</button>

// BIEN — Dialog avec focus trap et aria
<dialog aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirmer la suppression</h2>
  ...
</dialog>

// BIEN — Live region pour les notifications dynamiques
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// BIEN — Skip link (premier element focusable de la page)
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 ...">
  Aller au contenu principal
</a>

// MAL — Div cliquable sans semantique
<div onClick={handleClick}>Cliquez ici</div>

// BIEN — Button ou lien semantique
<button type="button" onClick={handleClick}>Cliquez ici</button>
```

### 13.3 Formulaires accessibles

```tsx
// BIEN — Label associe + erreur avec aria
<div>
  <label htmlFor="project-name">Nom du projet</label>
  <input
    id="project-name"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? "name-error" : "name-hint"}
  />
  <p id="name-hint" className="text-muted-foreground text-sm">
    200 caracteres maximum
  </p>
  {errors.name && (
    <p id="name-error" role="alert" className="text-destructive text-sm">
      {errors.name.message}
    </p>
  )}
</div>
```

### 13.4 Toasts et notifications

**Regle** : Verifier que la librairie de toasts (sonner, react-hot-toast) utilise `aria-live` pour annoncer les notifications aux lecteurs d'ecran. Sonner le fait nativement. Si votre librairie ne le fait pas, ajouter une live region.

### 13.5 Testing automatise

```bash
# Ajouter axe-core dans les tests d'integration
npm install -D @axe-core/react  # ou axe-core + vitest-axe
```

```typescript
// Dans les tests de composants
import { axe, toHaveNoViolations } from "jest-axe"; // ou vitest-axe
expect.extend(toHaveNoViolations);

it("n'a pas de violations a11y", async () => {
  const { container } = render(<ProjectCard project={mockProject} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 13.6 CSS d'accessibilite

```css
/* Focus visible sur tous les interactifs */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Respecter les preferences de mouvement reduit */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Migrations de schema

### 14.1 Principe fondamental

**"Le schema evolue. Les donnees existantes non."**

Chaque modification de schema doit repondre a cette question : "Que se passe-t-il pour les rows existantes ?" Si la reponse est "elles cassent", la migration est mal planifiee.

### 14.2 Regle d'or : Additive-first

Tout nouveau champ est optionnel par defaut. On ne rend un champ obligatoire qu'apres avoir backfille 100% des donnees existantes.

**Pattern en 3 phases** :

```
Phase 1 : Ajouter le champ optionnel → deployer
          (les rows existantes n'ont pas le champ — c'est OK)

Phase 2 : Backfill les donnees existantes
          (en batch borne, max 100 rows par execution)

Phase 3 : Une fois 100% migre, le champ peut devenir obligatoire
          (deployer la contrainte)
```

### 14.3 Les 5 types de migration

| Type | Strategie | Risque |
|---|---|---|
| Ajout de champ | Optionnel → backfill → obligatoire | Faible |
| Suppression de champ | Ignorer en lecture → retirer du schema → nettoyer | Moyen |
| Renommage de champ | Ajouter le nouveau → copier → supprimer l'ancien | Moyen |
| Changement de type | Nouveau champ → migration → suppression ancien | Eleve |
| Restructuration (split/merge) | Nouvelle table → migration → redirect queries → suppression | Eleve |

### 14.4 Regles strictes

- Jamais de migration destructive sans backup
- Migrations en batch borne (pas de `collect()` ni `SELECT *` sur toute la table)
- 1 fichier par migration dans `backend/migrations/`
- Nommage : `NNN-description-courte.ts` (numero sequentiel, pas de date)

```
backend/migrations/
├── 001-add-avatar-url.ts
├── 002-backfill-team-slug.ts
└── 003-merge-profiles.ts
```

> L'implementation des migrations (batch, transactions, rollback) depend du backend. Voir addon-[votre-backend].md.

### 14.5 Indexation

**Regle** : Tout champ utilise dans un `WHERE`, `ORDER BY`, ou `JOIN` frequent doit avoir un index. Documenter la strategie d'indexation dans le schema ou un ADR.

| Pattern | Index recommande |
|---|---|
| Filtre par `teamId` + tri par `createdAt` | Index compose `(teamId, createdAt)` |
| Recherche par `email` (unicite) | Index unique sur `email` |
| Soft delete : filtre `deletedAt IS NULL` | Index partiel sur `deletedAt IS NULL` |
| Cursor-based pagination par `id` | Index sur `id` (souvent la PK) |

### 14.6 Le piege du changement de type direct

```typescript
// MAL — Changer le type directement et deployer
// Le champ "priority" etait string ("high", "medium", "low")
// On veut le passer en number (1, 2, 3)
// → Les rows existantes ont encore des strings → crash a la lecture

// BIEN — Migration en 4 etapes
// 1. Ajouter "priorityNumber" (optionnel)
// 2. Backfill : convertir "high"→1, "medium"→2, "low"→3
// 3. Mettre a jour les queries pour lire "priorityNumber"
// 4. Supprimer l'ancien champ "priority" quand plus utilise
```

**Anti-patterns** :
- Deployer un changement de type sans migration (crash sur les rows existantes)
- Migration qui traite toutes les rows en une seule execution (timeout, OOM)
- Pas de fichier dedie — migration cachee dans un commit de feature

---

## 15. Gestion des dates

### 15.1 Deux formats selon le cas d'usage

**Regle V5 (corrigee)** : Utiliser le format adapte au type de donnee.

| Type de date | Format en base | Exemple |
|---|---|---|
| **Datetime** (horodatage precis) | `number` (timestamp ms UTC) | `createdAt`, `updatedAt`, `lastLoginAt` |
| **Date-only** (date calendaire sans heure) | `string` (`YYYY-MM-DD`) | `birthDate`, `dueDate`, `startDate` |

**Pourquoi deux formats ?**

Un timestamp pour une date de naissance cree des bugs de timezone insidieux : "15 mars minuit UTC" = "14 mars 19h a New York". La date `"2026-03-15"` est sans ambiguite.

```typescript
// BIEN — Datetime : timestamp millisecondes UTC
const project = {
  name: "Mon projet",
  createdAt: Date.now(),      // 1740500000000
  updatedAt: Date.now(),
};

// BIEN — Date-only : string YYYY-MM-DD
const user = {
  name: "Alice",
  birthDate: "1990-05-15",    // Pas d'heure, pas de timezone
  // Convention: date-only = string YYYY-MM-DD
};

// MAL — Timestamp pour une date calendaire
const task = {
  dueDate: new Date("2026-03-15").getTime(), // Quel timezone ? Bug garanti.
};

// MAL — String ISO pour un horodatage
const project = {
  createdAt: new Date().toISOString(), // Comparaisons de strings, parsing couteux
};
```

**Regle** : Documenter la convention dans le schema : `// Convention: date-only = YYYY-MM-DD string` et `// Convention: datetime = timestamp ms UTC`. L'appliquer uniformement dans tout le projet.

### 15.2 Formatage cote client uniquement

**Regle** : Le backend ne formate jamais de dates. Le frontend connait la locale et le timezone de l'utilisateur.

```typescript
// lib/utils.ts

/** Formate un timestamp en date lisible selon la locale francaise. */
export function formatDate(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(timestamp));
}

/** Formate un timestamp en date relative ("A l'instant", "Il y a 3h", etc.). */
export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return formatDate(timestamp);
}

/** Formate une date-only (YYYY-MM-DD) en date lisible. */
export function formatDateOnly(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day)); // Construction locale, pas UTC
}
```

### 15.3 Comparaisons

```typescript
// BIEN — Comparaison directe de timestamps
const isOverdue = project.dueTimestamp < Date.now();
const isRecent = Date.now() - project.createdAt < 86_400_000; // 24h

// BIEN — Comparaison de date-only strings
const isOverdue = task.dueDate < "2026-03-15"; // Comparaison lexicographique OK avec YYYY-MM-DD

// MAL — Conversion inutile
const isOverdue = new Date(project.dueDate) < new Date();
```

---

## 16. Soft delete et operations destructives

### 16.1 Regle : Evaluer par entite, pas de regle par defaut

Le soft delete n'est pas une regle universelle. Chaque entite doit etre evaluee individuellement.

| Entite | Soft delete ? | Raison |
|---|---|---|
| Projet, document, workspace | Oui | Valeur de retention, undo possible |
| Session, token, OTP | Non | Ephemere, pas de valeur |
| Donnees RGPD (sur demande utilisateur) | Hard delete obligatoire | Obligation legale |
| Entites de liaison apres suppression parent | Hard delete | Coherence referentielle |
| Commentaires, messages | Selon contexte | Visible par d'autres ? → soft delete |

### 16.2 Pattern soft delete

Quand le soft delete est retenu pour une entite :

- Champ `deletedAt: number | null` (timestamp de suppression, `null` si actif)
- Index sur `deletedAt` pour filtrer les entites actives
- Toutes les queries de liste filtrent `deletedAt === null` par defaut
- Purge automatique apres N jours (cron ou scheduler)

```typescript
// Schema — le champ deletedAt est optionnel (null = actif)
interface Project {
  name: string;
  teamId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

// Query de liste — toujours filtrer les supprimes
function listActiveProjects(teamId: string): Project[] {
  return db.query("projects")
    .filter({ teamId, deletedAt: null })
    .sort("desc", "createdAt");
}

// Soft delete — marquer, pas supprimer
function softDeleteProject(projectId: string): void {
  db.patch(projectId, { deletedAt: Date.now() });
}
```

> L'implementation de la purge automatique (cron, scheduler) depend du backend. Voir addon-[votre-backend].md.

### 16.3 UX des operations destructives

**Confirmation explicite** avant toute suppression. Utiliser un AlertDialog, pas un simple `window.confirm`.

```tsx
// BIEN — AlertDialog avec confirmation explicite
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Supprimer</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est irreversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Supprimer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Toast undo** : Quand le soft delete est utilise, un toast avec bouton "Annuler" est souvent une meilleure UX qu'un dialog de confirmation.

```tsx
const handleDelete = async () => {
  await softDeleteProject(projectId);
  toast("Projet supprime", {
    action: {
      label: "Annuler",
      onClick: () => restoreProject(projectId),
    },
  });
};
```

**Anti-pattern** : Suppression en 1 clic sans confirmation ni possibilite d'annulation.

---

## 17. Conventions de nommage

### 17.1 Table de reference

| Element | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `UserCard.tsx` |
| Fichier composant | PascalCase (= nom export) | `UserCard.tsx` |
| Hook custom | camelCase avec prefix `use` | `use-focus-hover.ts` |
| Store Zustand | camelCase avec prefix `use` | `use[Domain]Store` |
| Fichier utilitaire | kebab-case | `markdown-parser.ts` |
| Fonction | camelCase | `createUser()` |
| Constante | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Type/Interface | PascalCase | `UserProfile` |
| Props interface | PascalCase + `Props` | `UserCardProps` |
| Table DB (NoSQL) | camelCase | `userProjects` |
| Table DB (SQL) | snake_case | `user_profiles` |
| Variable CSS | kebab-case avec prefix `--` | `--color-primary` |
| Cle localStorage | kebab-case avec prefix projet | `myapp-view-store` |
| Fichiers Next.js | conventions Next.js | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Fichier migration | NNN-kebab-case | `001-add-avatar-url.ts` |
| Fichier de test | PascalCase + .test | `UserCard.test.tsx` |
| Schema Zod | camelCase + Schema | `createProjectSchema` |

### 17.2 Regles strictes

**Le nom du fichier = le nom de l'export principal.**

```
BIEN : AddUserDialog.tsx → export function AddUserDialog
MAL  : UserUploadSheet.tsx → export function AddUserDialog
```

**Les acronymes restent en casse naturelle.**

```
BIEN : userId, apiKey, htmlContent
MAL  : userID, APIKey, HTMLContent
```

---

## 18. CSS et design tokens

### 18.1 Zero valeur hardcodee

```tsx
// MAL — Couleurs et tailles hardcodees
<div className="text-emerald-400 bg-[#1a1a2e] p-[13px]">

// BIEN — Tokens du design system
<div className="text-primary bg-card p-3">
```

**Toute couleur doit venir des tokens CSS definis dans `globals.css`.**

### 18.2 Layout flex — La regle d'or

**Dans un layout flex/grid imbrique, utiliser `flex-1 min-h-0` (jamais `h-full`).**

```tsx
// MAL — Casse l'overflow dans les contextes imbriques
<div className="h-full overflow-y-auto">

// BIEN — Le flex-1 min-h-0 propage correctement l'overflow
<div className="flex-1 min-h-0 overflow-y-auto">
```

### 18.3 Responsive — Mobile-first

```tsx
// Cacher sur mobile, montrer sur desktop
<div className="hidden md:flex">

// Padding adaptatif
<div className="p-3 md:p-4">
```

---

## 19. Observabilite

> **Remplace l'ancien §20 Logging de la V4.** L'ancien logger (qui utilisait `console.log` en prod, en contradiction avec §21 qui l'interdisait) est remplace par une approche complete.

### 19.1 Les 3 piliers

| Pilier | Quoi | Outil typique |
|---|---|---|
| **Logs** | Evenements structures (JSON) | Pino, Winston, Axiom |
| **Metriques** | Compteurs numeriques (RED: Rate/Errors/Duration) | Prometheus, Datadog, Vercel Analytics |
| **Traces** | Cheminement d'une requete a travers les services | Sentry, OpenTelemetry |

### 19.2 Logger structure

**Regle** : Pas de `console.log` en production. En dev, `console.log` est tolere pour le debug temporaire mais doit etre supprime avant commit.

```typescript
// lib/logger.ts
import pino from "pino"; // ou autre — l'important est le format structure

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // En prod : JSON pour ingestion par Datadog/Sentry/Axiom
  // En dev : pretty-print lisible
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined,
});

// Usage
logger.info({ userId: user.id, projectId }, "Project created");
logger.error({ err, correlationId }, "Payment processing failed");

// JAMAIS en prod :
// console.log("project created"); // <- pas structure, pas de metadata
```

**Si Pino est trop lourd pour votre projet**, un logger minimal suffit — l'important est le format JSON structure :

```typescript
// lib/logger.ts — Version minimale
type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "production") {
    // JSON structure — jamais console.log nu
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    console[level](`[${level.toUpperCase()}] ${message}`, data ?? "");
  }
}

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
};
```

### 19.3 Correlation ID

**Principe** : Chaque requete utilisateur recoit un ID unique qui la suit a travers tous les logs, du frontend au backend jusqu'aux jobs asynchrones.

```typescript
// middleware.ts — Generer ou propager le correlation ID (voir §6.3)
const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
requestHeaders.set("x-correlation-id", correlationId);
```

```typescript
// Backend — Inclure dans chaque log
export async function createProject(ctx: AuthContext, input: CreateProjectInput) {
  const correlationId = ctx.headers.get("x-correlation-id");
  logger.info({ correlationId, input }, "Creating project");

  try {
    const result = await db.insert("projects", { ... });
    logger.info({ correlationId, projectId: result.id }, "Project created");
    return result;
  } catch (error) {
    logger.error({ correlationId, err: error }, "Failed to create project");
    throw error;
  }
}
```

```typescript
// Frontend — Envoyer le correlation ID dans chaque requete
const correlationId = crypto.randomUUID();

const res = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-correlation-id": correlationId,
  },
  body: JSON.stringify(data),
});
```

### 19.4 Error tracking

**Regle** : Integrer un service d'error tracking (Sentry recommande) des le premier deploiement.

**Minimum requis** :

- Source maps uploadees a chaque deploy
- Breadcrumbs automatiques (navigation, clicks, fetches)
- Correlation avec le correlation ID
- Alertes sur les nouvelles erreurs

```typescript
// lib/error-tracking.ts
import * as Sentry from "@sentry/nextjs";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("[DEV ERROR]", error, context);
  }
}
```

### 19.5 Metriques RED

Pour chaque endpoint/mutation critique, mesurer :

| Metrique | Quoi | Alerte si |
|---|---|---|
| **Rate** | Nombre de requetes/minute | Chute brutale (service down ?) |
| **Errors** | % de requetes en erreur | > 1% sur 5 min |
| **Duration** | Temps de reponse p50/p95/p99 | p95 > 2s |

> L'implementation depend de l'infrastructure (Vercel Analytics, Datadog, Prometheus). Voir addon-[votre-infra].md.

### 19.6 Budget alerte minimal

| Alerte | Seuil | Canal |
|---|---|---|
| Erreur 5xx > 1% pendant 5 min | Critique | Slack/PagerDuty |
| Latence p95 > 3s pendant 10 min | Warning | Slack |
| Nouvelle erreur non-vue | Info | Email/Sentry |
| Quota DB / API IA > 80% | Warning | Slack |

---

## 20. Git et workflow

### 20.1 Conventional Commits avec scope

```
feat(auth): ajouter login OAuth Google
fix(dashboard): corriger le compteur de projets
refactor(api): extraire helper de validation
chore(deps): mettre a jour next.js vers 15.2
test(users): ajouter tests unitaires createUser
```

**Un commit = un changement atomique.** Pas de commits "WIP" ou "fix stuff".

### 20.2 Branches

```
main              ← production
feat/nom-feature  ← feature en cours
fix/nom-bug       ← correction de bug
refactor/nom      ← refactoring structurel
```

### 20.3 CI obligatoire

**Avant tout merge sur main, la CI doit passer :**

```
1. npx tsc --noEmit      → zero erreur TypeScript
2. npx eslint .           → zero warning
3. npx prettier --check . → zero erreur de formatage
4. npx vitest run         → zero test en echec
5. npx next build         → build reussie
```

**La CI est bloquante.** Pas de merge si un check echoue. Pas de `--no-verify`.

### 20.4 Diff max par PR

**Max 400 lignes de diff par PR.** Au-dela, decouper en PRs plus petites. Les PRs massives ne sont pas reviewables.

---

## 21. Tests

### 21.1 Philosophie

**Un code sans tests n'est pas clean -- c'est un code qui fonctionne par accident.**

Regle directrice : **Tester le comportement, pas l'implementation.**

### 21.2 Pyramide des tests

| Type | Outil | Quand |
|---|---|---|
| Unitaire | Vitest | Helpers, utils, fonctions pures, validations |
| Integration | Vitest + Testing Library | Composants avec logique, formulaires, interactions |
| Contract | Vitest + Zod schemas | Contrats API (voir §8.4) |
| E2E | Playwright | Parcours critiques (auth, CRUD principal, paiement) |

> Ref: Kent C. Dodds "Testing Trophy" — les tests d'integration offrent le meilleur ratio confiance/cout. Prioriser les tests d'integration sur les tests unitaires pour les composants.

### 21.3 Priorisation

| Priorite | Quoi tester | Pourquoi |
|---|---|---|
| P0 — Critique | Mutations qui modifient des donnees (create, update, delete) | Bug = donnees corrompues, irreversible |
| P0 — Critique | Auth guards | Bug = faille de securite |
| P1 — Elevee | Fonctions de validation / helpers partages | Utilises partout, un bug se propage |
| P1 — Elevee | Logique de paiement / billing | Bug = perte d'argent |
| P1 — Elevee | Contrats API (schemas Zod partages) | Bug = rupture silencieuse frontend/backend |
| P2 — Moyenne | Queries de liste avec filtres/pagination | Bugs visibles mais pas destructeurs |
| P2 — Moyenne | Composants formulaire (soumission, validation) | Bugs UX frequents |
| P3 — Faible | Composants d'affichage pur | Rarement casses, reperes visuellement |

### 21.4 Mocking — Principes

**Regle 1** : Mocker les frontieres (appels DB, API externes), pas les internals.

**Regle 2** : Un mock ne doit jamais reimplementer la logique metier. Il retourne des donnees fixes.

**Regle 3** : Utiliser MSW (Mock Service Worker) pour mocker au niveau reseau plutot qu'au niveau module quand possible. MSW intercepte les requetes HTTP et retourne des reponses controlees, ce qui teste le code de serialisation/deserialisation.

```typescript
// tests/helpers/msw-handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/projects", () => {
    return HttpResponse.json([
      { id: "1", name: "Projet A", status: "active" },
      { id: "2", name: "Projet B", status: "draft" },
    ]);
  }),

  http.post("/api/projects", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "3", ...body }, { status: 201 });
  }),
];
```

> Voir addon-[votre-backend].md pour les mocks specifiques a votre backend (contexte DB, auth, storage).

**Mock d'un store Zustand** :

```typescript
vi.mock("@/lib/stores/view-store", () => ({
  useViewStore: vi.fn(() => ({
    view: "list",
    setView: vi.fn(),
  })),
}));
```

**Test unitaire d'un helper** :

```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { filterUndefined } from "./utils";

describe("filterUndefined", () => {
  it("supprime les champs undefined", () => {
    expect(filterUndefined({ a: 1, b: undefined, c: "ok" }))
      .toEqual({ a: 1, c: "ok" });
  });

  it("retourne un objet vide si tout est undefined", () => {
    expect(filterUndefined({ a: undefined })).toEqual({});
  });
});
```

### 21.5 Test data factories

**Regle** : Utiliser des factories pour generer des donnees de test coherentes. Pas de copier-coller d'objets entre tests.

```typescript
// tests/helpers/factories.ts
import type { Project } from "@/lib/schemas/project";

let idCounter = 0;

export function createMockProject(overrides: Partial<Project> = {}): Project {
  idCounter++;
  return {
    id: `proj_${idCounter}`,
    name: `Projet ${idCounter}`,
    teamId: "team_default",
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}
```

### 21.6 Seuils de couverture

**Recommandation** (pas de regle absolue — adapter au contexte) :

| Metrique | Seuil minimum | Cible |
|---|---|---|
| Lignes | 60% | 80% |
| Branches | 50% | 70% |
| Fonctions | 60% | 80% |

**Les seuils sont un signal, pas un objectif.** 100% de couverture avec des tests fragiles est pire que 70% avec des tests solides.

```jsonc
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
      },
    },
  },
});
```

### 21.7 Regle du test de regression

**Pas de fix sans test.**

Quand un bug est trouve en production :
1. Ecrire le test qui reproduit le bug (il doit echouer)
2. Fixer le code (le test passe)
3. Committer test + fix ensemble dans le meme commit

Un bug qui revient est un bug qu'on n'a pas teste.

### 21.8 Structure des fichiers de test

Les tests vivent a cote du code. Les tests E2E et helpers partages vivent a la racine.

```
project/
├── components/
│   └── projects/
│       ├── ProjectCard.tsx
│       └── __tests__/
│           └── ProjectCard.test.tsx
├── lib/
│   ├── utils.ts
│   ├── schemas/
│   │   ├── project.ts
│   │   └── __tests__/
│   │       └── project.contract.test.ts
│   └── __tests__/
│       └── utils.test.ts
├── backend/
│   ├── projects.ts
│   └── __tests__/
│       └── projects.test.ts
└── tests/                    ← E2E + helpers partages
    ├── helpers/
    │   ├── setup.ts
    │   ├── factories.ts
    │   └── msw-handlers.ts
    └── e2e/
        ├── auth.spec.ts
        └── projects.spec.ts
```

---

## 22. Variables d'environnement

### 22.1 Validation au demarrage

L'application doit **crash au demarrage** si une variable obligatoire manque. Pas en runtime au milieu d'une requete.

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional(), // Optionnel en dev
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  // ajouter toutes les variables requises
});

export const env = envSchema.parse(process.env);
```

### 22.2 Regles

- **`NEXT_PUBLIC_*`** : Expose au client. JAMAIS de secrets.
- **Variables serveur** : Accessibles uniquement dans les Server Components, Route Handlers et Server Actions.
- **Valeur par defaut** : Uniquement pour les variables non-critiques (ex: `LOG_LEVEL`).

---

## 23. DX Tooling & Enforcement

> **But** : Automatiser l'application des regles. Ce qui peut etre verifie par une machine ne doit jamais reposer sur la discipline humaine (ou IA).

### 23.1 La pyramide d'enforcement

```
                    ┌─────────┐
                    │   CI    │  ← Dernier filet. Bloquant. Rien ne merge si ca echoue.
                  ┌─┤         ├─┐
                  │ └─────────┘ │
                ┌─┴─────────────┴─┐
                │    pre-push     │  ← Tests + build. Avant d'envoyer sur le remote.
              ┌─┤                 ├─┐
              │ └─────────────────┘ │
            ┌─┴─────────────────────┴─┐
            │       pre-commit        │  ← Format + lint + types. Rapide (< 10s).
          ┌─┤                         ├─┐
          │ └─────────────────────────┘ │
        ┌─┴─────────────────────────────┴─┐
        │          IDE (save)             │  ← Feedback instantane. Format auto.
        └─────────────────────────────────┘
```

| Couche | Quand | Quoi | Duree cible |
|---|---|---|---|
| **IDE** | A chaque save | Format auto + erreurs en temps reel | Instantane |
| **pre-commit** | `git commit` | Format + lint (fichiers stages) | < 10 secondes |
| **pre-push** | `git push` | Type-check + tests unitaires | < 60 secondes |
| **CI** | Pull Request | Tout : types + lint + format + tests + build | < 5 minutes |

### 23.2 Stack recommandee : ESLint + Prettier

Pour un projet Next.js avec Tailwind + shadcn, ESLint + Prettier reste le choix par defaut. Les plugins `eslint-config-next/core-web-vitals`, `eslint-plugin-jsx-a11y`, et `prettier-plugin-tailwindcss` n'ont pas d'equivalent Biome.

> **Alternative Biome** : Si le projet n'a pas besoin de plugins ESLint specifiques, Biome (10-25x plus rapide, un seul fichier de config) est une option viable. Adapter les commandes ci-dessous.

### 23.3 Installation

```bash
# Linting + formatting
npm install -D eslint eslint-config-next eslint-config-prettier \
  prettier prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Git hooks
npm install -D husky lint-staged

# Initialisation Husky
npx husky init

# Commit message validation (optionnel mais recommande)
npm install -D @commitlint/cli @commitlint/config-conventional
```

### 23.4 Scripts package.json

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate": "npm run typecheck && npm run lint && npm run test && npm run build",
    "prepare": "husky"
  }
}
```

### 23.5 ESLint flat config

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // TOUJOURS en dernier — desactive les regles qui conflictent avec Prettier

  globalIgnores([
    ".next/**", "out/**", "build/**", "dist/**",
    "node_modules/**", "next-env.d.ts", "coverage/**",
  ]),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "error",
    },
  },
]);

export default eslintConfig;
```

### 23.6 Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 23.7 Husky — Git Hooks

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/pre-push
npm run typecheck && npm run test
```

```bash
# .husky/commit-msg (optionnel)
npx commitlint --edit $1
```

### 23.8 lint-staged

```javascript
// lint-staged.config.mjs
import path from "path";

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(" ")}`;

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
  "*.{css,scss}": ["prettier --write"],
  "*.{md,json}": ["prettier --write"],
};
```

> **Pourquoi PAS de `tsc --noEmit` dans lint-staged ?** Le type-checking a besoin du projet entier. Lancer `tsc` dans lint-staged revient a type-checker tout le projet a chaque commit. Deplacer vers le pre-push.

### 23.9 CI — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Validate
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx prettier --check .
      - run: npx vitest run --reporter=verbose
      - run: npx next build
```

### 23.10 VSCode — Settings partagees

```jsonc
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "files.eol": "\n"
}
```

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

**Regle** : Les fichiers `.vscode/` sont committes dans le repo. Chaque developpeur (et agent IA) a le meme environnement.

### 23.11 Recapitulatif

| Verification | IDE (save) | Pre-commit | Pre-push | CI |
|---|---|---|---|---|
| **Prettier format** | Auto-fix | Auto-fix (staged) | — | Check |
| **ESLint** | Erreurs inline | Auto-fix (staged) | — | Check |
| **TypeScript** | Erreurs inline | — | `tsc --noEmit` | `tsc --noEmit` |
| **Tests unitaires** | — | — | `vitest run` | `vitest run` |
| **Build** | — | — | — | `next build` |
| **Commit message** | — | commit-msg hook | — | — |

---

## 24. Anti-patterns interdits

### 24.1 Les 42 interdits absolus

| # | Anti-pattern | Correction |
|---|---|---|
| 1 | `console.log` en production | Logger structure (§19) |
| 2 | `any` sans justification | `unknown` + type guard |
| 3 | `as` cast sans `// EXCEPTION-TYPECAST` | Adapter l'interface ou documenter |
| 4 | Copier-coller > 3 lignes (meme raison de changement) | Extraire helper/composant |
| 5 | Composant > 500 lignes | Decomposer |
| 6 | useEffect pour etat derive | useMemo ou calcul inline |
| 7 | Mutation sans try/catch | try/catch + toast |
| 8 | Mutation sans feedback utilisateur | toast.success/error |
| 9 | Couleur hardcodee (#fff, emerald-400) | Token CSS |
| 10 | `h-full` dans flex imbrique | `flex-1 min-h-0` |
| 11 | `dangerouslySetInnerHTML` sans sanitize | DOMPurify |
| 12 | Route API sans auth (sauf public documente) | Auth check |
| 13 | Champ texte sans limite de taille | Validation serveur |
| 14 | 2 endpoints pour la meme operation | Source unique |
| 15 | Nom fichier different du nom export | Renommer |
| 16 | Seed data dans fichier logique | Fichier separe |
| 17 | Query dans un dialog ferme sans condition sur l'ouverture | Conditionner sur `open` |
| 18 | `fetch()` sans check `res.ok` | Check + throw |
| 19 | Melange useState + RHF **pour les memes champs** | Un seul systeme par champ |
| 20 | throw Error generique au lieu d'erreur structuree | Erreur avec code (NOT_FOUND, etc.) |
| 21 | `key={index}` dans une liste dynamique | Utiliser un ID stable |
| 22 | Fetch dans une boucle `.map()` (N+1) | `Promise.all` ou batch |
| 23 | Datetime sans timezone | Stocker en UTC (timestamp ms) |
| 24 | Mutation non-idempotente sans idempotency key | Idempotency key (§11) |
| 25 | `<div onClick>` sans semantique | `<button type="button">` |
| 26 | Import relatif > 1 niveau (`../../..`) | Path alias `@/` |
| 27 | Hard delete sur entite principale sans evaluation | Table de decision soft/hard delete |
| 28 | Timestamp pour une date calendaire (birthDate, dueDate) | String `YYYY-MM-DD` |
| 29 | Formatage de date cote serveur | Formater cote client uniquement |
| 30 | Mutation sans `updatedAt` | Toujours mettre a jour `updatedAt` |
| 31 | Effet de bord bloquant dans une mutation (email, webhook) | Scheduler/queue asynchrone |
| 32 | Migration destructive sans backfill prealable | Champ optionnel → backfill → obligatoire |
| 33 | Barrel export (`index.ts`) hors `ui/` et `hooks/` | Import direct du fichier source |
| 34 | Rate limiter in-memory en serverless | Service externe (Upstash, Redis) |
| 35 | Spinner plein ecran pour operation locale | Skeleton, useTransition, ou loading local |
| 36 | Etat intermediaire visible dans l'UI | Filtrer les etats intermediaires des queries |
| 37 | Cookie de session sans `httpOnly` + `secure` | Flags securises obligatoires (§9.1) |
| 38 | Passer une fonction/Map/Set comme prop SC → CC | Types serialisables uniquement (§3.2) |
| 39 | Schema Zod defini en double (frontend et backend) | Source unique dans `lib/schemas/` (§8) |
| 40 | Update concurrent sans optimistic locking | Version field + CONFLICT (§11.3) |
| 41 | `--no-verify` sur git commit/push | Jamais (sauf urgence documentee) |
| 42 | `console.log` oublie avant commit | Lint rule + pre-commit hook |

### 24.2 Patterns a surveiller (pas interdits, mais suspects)

| Pattern | Quand c'est OK | Quand c'est un probleme |
|---|---|---|
| 8+ useState dans un composant | Formulaire simple, champs independants | Champs lies/dependants → useReducer |
| Promise.all avec map | Liste bornee (< 50 elements) | Liste non bornee → pagination |
| Ternaire imbrique | 2 niveaux max | 3+ niveaux → fonction nommee |
| `useEffect` avec [] vide | Init unique (focus, scroll) | Fetch de donnees → useQuery |
| Optimistic UI | Action rapide avec rollback gere | Action complexe sans gestion d'erreur de rollback |

---

## 25. Checklist PR

Avant chaque Pull Request, verifier :

### Backend

- [ ] Auth check sur toute query/mutation scopee
- [ ] Erreur structuree avec code standardise (pas `new Error` generique)
- [ ] `filterUndefined()` pour les patches partiels
- [ ] Pagination sur les queries de liste
- [ ] Limites de taille sur les champs texte
- [ ] Pas de duplication de mutation
- [ ] Idempotency key sur les mutations non-idempotentes
- [ ] Optimistic locking si edition concurrente possible

### Frontend

- [ ] Composant < 300 lignes (ou decompose avec `// EXCEPTION:`)
- [ ] Nom fichier = nom export
- [ ] try/catch + toast sur toute mutation
- [ ] Queries conditionnees sur `open` dans les dialogs
- [ ] Pas de couleurs hardcodees
- [ ] `flex-1 min-h-0` (pas `h-full`) dans les layouts flex imbriques
- [ ] Erreurs API mappees vers les champs de formulaire quand pertinent

### Contrats API

- [ ] Types derives de schemas Zod partages (`lib/schemas/`)
- [ ] Pas de types definis manuellement quand un type genere existe
- [ ] Contract tests pour les schemas modifies
- [ ] Seuls des types serialisables passent la frontiere SC → CC

### Server Components

- [ ] Pas de `"use client"` sans justification (interactivite, hooks, APIs navigateur)
- [ ] Frontiere client/serveur la plus basse possible dans l'arbre
- [ ] `loading.tsx` + `error.tsx` sur chaque route avec fetch async
- [ ] Pas de fonctions/Map/Set passees en props vers un Client Component

### TypeScript

- [ ] Zero `any`
- [ ] Zero `as` non documente
- [ ] Interfaces de props explicites
- [ ] Constantes typees (pas de listes hardcodees)
- [ ] `never` dans les switch exhaustifs
- [ ] `satisfies` prefere a `as` quand possible

### Accessibilite

- [ ] Tout `<input>` a un `<label>` ou `aria-label`
- [ ] Tout element interactif est navigable au clavier
- [ ] Contraste texte suffisant (WCAG AA)
- [ ] `<img>` avec `alt` descriptif ou `alt=""`
- [ ] `aria-invalid` + `aria-describedby` sur les champs en erreur

### Tests

- [ ] Au moins 1 test sur le code modifie
- [ ] Tests existants toujours verts
- [ ] Contract tests mis a jour si un schema a change

### Securite

- [ ] Cookies de session avec flags securises
- [ ] CSRF protege pour mutations sensibles
- [ ] Pas de secrets dans `NEXT_PUBLIC_*`
- [ ] Upload valide (MIME type + taille)

### Observabilite

- [ ] Correlation ID propage dans les nouveaux endpoints
- [ ] Erreurs critiques capturees par Sentry/error tracking
- [ ] Pas de `console.log` en production

### General

- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npx eslint .` passe sans warning
- [ ] `npx prettier --check .` passe
- [ ] Diff relu — pas de secrets, pas de fichiers inutiles
- [ ] Pas de fichier > 300 LoC sans justification
- [ ] Variables d'environnement ajoutees dans `lib/env.ts` si nouvelles

### Migrations

- [ ] Nouveau champ = optionnel avec plan de backfill
- [ ] Pas de changement de type destructif sans migration
- [ ] Fichier de migration dedie avec numero sequentiel
- [ ] Index ajoute pour les nouveaux champs filtres/tries

### Dates

- [ ] Datetimes en timestamp millisecondes UTC
- [ ] Dates-only en string YYYY-MM-DD
- [ ] Formatage cote client uniquement
- [ ] `updatedAt` mis a jour sur chaque patch

### Operations destructives

- [ ] Soft/hard delete evalue selon la table de decision
- [ ] Confirmation UI avant suppression
- [ ] `deletedAt` filtre dans les queries de liste

### Imports

- [ ] Path aliases `@/` partout
- [ ] Imports groupes par categorie avec sauts de ligne
- [ ] Pas de barrel exports hors `ui/` et `hooks/`

### Next.js

- [ ] Pas de `"use client"` sans justification
- [ ] Pattern composition (children) prefere a l'import direct
- [ ] `<Suspense>` pour les sections de donnees independantes
- [ ] Revalidation explicite apres mutation (Server Actions)
- [ ] Middleware pour les decisions de routing (pas de logique metier lourde)

---

## Annexe A : Systeme d'add-ons

Ce document contient les regles universelles applicables a tout projet Next.js + React + TypeScript, quel que soit le backend.

Pour les regles specifiques a votre stack backend, consulter l'add-on correspondant :

| Add-on | Quand l'utiliser |
|---|---|
| `addon-convex.md` | Projets utilisant Convex comme backend |
| `addon-supabase.md` | Projets utilisant Supabase |
| `addon-[backend].md` | Autres backends (Prisma, Drizzle, Firebase, etc.) |

Chaque add-on mappe les concepts generiques du core vers l'implementation concrete :

| Concept du core | Exemples d'implementations par add-on |
|---|---|
| Erreurs structurees | `ConvexError`, `PostgrestError`, custom `AppError`, etc. |
| Queries conditionnelles | `"skip"` (Convex), `enabled: false` (TanStack), `null` check, etc. |
| Types generes | `Doc<>`, `Id<>` (Convex), `Database["table"]` (Supabase), Prisma types, etc. |
| Validators backend | `v.string()` (Convex), RLS policies (Supabase), Zod middleware, etc. |
| Rate limiting | Solution native ou service externe (Upstash, Redis) |
| Scheduler / Queue | `ctx.scheduler.runAfter` (Convex), pg_cron (Supabase), Bull, etc. |
| Migrations batch | `internalMutation` (Convex), SQL migrations, Prisma migrate, etc. |
| Tests — mocking backend | Mock `ctx.db` (Convex), mock Supabase client, mock Prisma, etc. |
| Observabilite | Intégration Sentry, transport Pino, Vercel Analytics, etc. |

**Principe** : Le core definit le "quoi" et le "pourquoi". L'add-on definit le "comment" pour votre stack.

---

## Annexe B : Architecture Decision Records (ADR)

Pour les decisions architecturales qui ne sont pas couvertes par cette constitution, documenter dans `docs/adr/` :

**Format** :

```markdown
# ADR-NNN: Titre de la decision

## Statut
Accepte / Propose / Deprecie

## Contexte
Quel probleme on resout ?

## Decision
Qu'est-ce qu'on a decide ?

## Consequences
Quels sont les impacts positifs et negatifs ?
```

**Exemples de sujets pour un ADR** :
- Choix du backend (Convex vs Supabase vs Prisma)
- Choix de la strategie d'auth (NextAuth vs Clerk vs custom)
- Choix de TanStack Query vs RSC natif pour une feature
- Structure feature-based vs structure par type (au-dela de 15 entites)

---

> **Ce document est la constitution du projet.** Tout code qui enfreint ces regles doit etre corrige avant merge. Les exceptions sont autorisees si elles respectent la meta-regle de la section 0. Chaque exception doit etre documentee avec `// EXCEPTION: [raison]`.
>
> **Pour les agents de code IA** : Ce document fait autorite. En cas de doute, appliquer la regle. Si une regle semble inadaptee a un cas precis, documenter l'exception et continuer.
>
> **Changelog** : V4 → V5. Score council V4 : 78.4/100. Lacunes corrigees : contrats API, serialisation RSC, securite session/CSRF, idempotence/concurrence, observabilite, remote state, DX tooling. Exemples techniques corriges : §3.1, §7.2, §7.4, §4.2, §6.3, §13.1.
