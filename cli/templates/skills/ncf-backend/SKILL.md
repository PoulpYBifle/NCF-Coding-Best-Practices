---
name: ncf-backend
description: |
  Patterns et regles backend/API/DB/securite pour projets Next.js + TypeScript.
  Utiliser des que l'utilisateur travaille sur une mutation, une query, une route API,
  une migration de base de donnees, de l'authentification, de la securite, des schemas Zod,
  de l'observabilite, ou toute logique serveur.
  Couvre : template mutation, erreurs structurees, pagination, idempotence, optimistic locking,
  contrats API Zod, sessions, CSRF, rate limiting, migrations, dates, soft delete, logger.
metadata:
  author: NCF
  version: 1.0.0
  category: backend
---

# NCF Backend Patterns

## 1. Template de mutation (ordre obligatoire)

Chaque fonction backend suit cet ordre :

```typescript
export async function createProject(ctx: AuthContext, input: unknown) {
  // 1. AUTH — toujours en premier
  const user = await requireAuth(ctx);
  await requirePermission(user, "projects.create", input.teamId);

  // 2. VALIDATION — regles metier
  const parsed = createProjectSchema.parse(input);
  if (parsed.name.length > 200) {
    throw new AppError({ code: "VALIDATION", message: "Nom trop long" });
  }

  // 3. VERIFICATION — existence des entites referencees
  const team = await db.findById("teams", parsed.teamId);
  if (!team) throw new AppError({ code: "NOT_FOUND", message: "Equipe introuvable" });

  // 4. OPERATION — insertion/modification
  return await db.insert("projects", { ...parsed, createdAt: Date.now() });
}
```

## 2. Erreurs structurees

Toujours `throw new AppError({ code, message })`, jamais `throw new Error("...")`.

| Code | Usage | Exemple |
|---|---|---|
| `NOT_FOUND` | Entite inexistante | "Projet introuvable" |
| `UNAUTHORIZED` | Non authentifie | "Session expiree" |
| `FORBIDDEN` | Pas autorise | "Acces refuse" |
| `VALIDATION` | Donnees invalides | "Nom trop long (max 200)" |
| `CONFLICT` | Duplication, version mismatch | "Nom deja pris" |
| `LIMIT_EXCEEDED` | Quota, taille max | "Limite de 10 projets" |
| `INTERNAL` | Erreur inattendue | Log + message generique |

### Extraction frontend

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erreur inattendue";
}
```

## 3. Pagination obligatoire

Toute query de liste doit definir `limit` + `sort`. Interdit de retourner une liste non bornee.

| Strategie | Quand | Avantage |
|---|---|---|
| Offset/Limit | Petites collections (< 10k), navigation par page | Simple |
| Cursor-based | Grandes collections, infinite scroll | Performant |

```typescript
async function listProjects(teamId: string, limit = 50) {
  const safeLimit = Math.min(limit, 100); // Toujours borner
  return await db.find("projects", {
    where: { teamId },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });
}
```

## 4. Contrats API — Schemas Zod partages

Source de verite unique dans `lib/schemas/` :

```typescript
// lib/schemas/project.ts
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  teamId: z.string(),
  status: z.enum(["active", "archived", "draft"]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const createProjectSchema = projectSchema.pick({ name: true, teamId: true });
export const updateProjectSchema = projectSchema.partial().pick({ name: true, status: true });

// Types derives — jamais definis manuellement
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

- Backend et frontend importent le MEME schema
- Contract tests dans `lib/schemas/__tests__/`
- Valider toute reponse d'API EXTERNE avec un schema Zod

### Validation en 3 couches
```
Client (UX)      : Zod dans le formulaire (feedback instantane)
Backend (securite): Validators + checks dans le handler
DB (integrite)   : Schema DB = source de verite
```

Ne JAMAIS faire confiance au client.

## 5. Idempotence

| Mutation | Naturellement idempotente ? | Cle necessaire ? |
|---|---|---|
| `updateProject(id, { name })` | Oui | Non |
| `createProject({ name })` | Non (doublon) | Oui |
| `processPayment({ amount })` | Non | Oui |
| `deleteProject(id)` | Oui (no-op) | Non |
| `sendInviteEmail(email)` | Non | Oui |

```typescript
// Backend
export async function createPayment(ctx, input, idempotencyKey: string) {
  const existing = await db.findOne("idempotency_keys", { key: idempotencyKey });
  if (existing) return existing.result; // Retourner le resultat precedent

  const result = await db.insert("payments", { ...input });
  await db.insert("idempotency_keys", { key: idempotencyKey, result, createdAt: Date.now() });
  return result;
}

// Frontend — Generer la cle au MONTAGE, pas au clic
const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
```

## 6. Optimistic Locking

Quand plusieurs utilisateurs peuvent modifier la meme entite :

```typescript
export async function updateProject(ctx, projectId, input) {
  const project = await db.findById("projects", projectId);
  if (project.version !== input.expectedVersion) {
    throw new AppError({ code: "CONFLICT", message: "Modifie par quelqu'un d'autre" });
  }
  return await db.update("projects", projectId, {
    ...input, version: project.version + 1, updatedAt: Date.now(),
  });
}
```

Frontend : proposer de recharger la page en cas de CONFLICT.

## 7. Operations multi-etapes

1. Etat intermediaire explicite (`status: "creating"`)
2. Compensation definie pour chaque etape (rollback)
3. Etats intermediaires filtres des queries par defaut
4. Effets de bord non-critiques (emails, webhooks) → scheduler/queue

## 8. Securite

### Sessions & Cookies

| Flag | Valeur | Raison |
|---|---|---|
| `httpOnly` | `true` | Empeche acces JS (XSS) |
| `secure` | `true` (prod) | HTTPS uniquement |
| `sameSite` | `lax` | Protection CSRF de base |
| `maxAge` | Selon besoin | Expiration explicite |

- Verifier la VALIDITE du token (signature + expiration), pas juste sa presence
- Rotation apres login / changement de mot de passe

### CSRF
- `sameSite: lax` = minimum
- Mutations sensibles (paiement, mot de passe) : token CSRF explicite

### Autorisation : deny by default
Tout est refuse par defaut. L'acces doit etre explicitement accorde.

```typescript
async function requirePermission(user, permission, resourceOwnerId?) {
  if (user.role === "admin") return;
  if (resourceOwnerId && user.id === resourceOwnerId) return;
  throw new AppError({ code: "FORBIDDEN", message: "Acces refuse" });
}
```

### Rate limiting
| Operation | Limite |
|---|---|
| Login / auth | 5 req/min/IP |
| Signup | 3 req/min/IP |
| API publique | 60 req/min/IP |
| Upload | 10 req/min/user |

Service externe (Upstash, Redis). Jamais in-memory en serverless.

### Variables d'environnement
```typescript
// lib/env.ts — Crash au demarrage si variable manquante
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});
export const env = envSchema.parse(process.env);
```

- `NEXT_PUBLIC_*` : expose au client → JAMAIS de secrets
- Valeurs par defaut uniquement pour variables non-critiques

### Limites de taille

| Champ | Limite |
|---|---|
| Nom, titre | 200 caracteres |
| Description | 2 000 caracteres |
| Contenu markdown | 500 000 caracteres |
| Email | 320 caracteres |
| Array | 50 elements max |

## 9. Base de donnees

### Migrations — Additive-first
Tout nouveau champ est optionnel par defaut :
```
Phase 1 : Ajouter le champ optionnel → deployer
Phase 2 : Backfill (batch borne, max 100 rows)
Phase 3 : 100% migre → champ peut devenir obligatoire
```

1 fichier par migration : `NNN-description.ts`

### Indexation
Tout champ dans WHERE/ORDER BY/JOIN frequent → index.

| Pattern | Index |
|---|---|
| Filtre teamId + tri createdAt | Compose (teamId, createdAt) |
| Recherche email unique | Index unique |
| Soft delete | Index partiel (deletedAt IS NULL) |

### Soft delete — Table de decision

| Entite | Soft delete ? |
|---|---|
| Projet, document, workspace | Oui (retention, undo) |
| Session, token, OTP | Non (ephemere) |
| Donnees RGPD | Hard delete (obligation legale) |

Pattern : `deletedAt: number | null`. Filtrer `deletedAt === null` par defaut.

### Dates

| Type | Format | Exemple |
|---|---|---|
| Datetime | number (timestamp ms UTC) | createdAt, updatedAt |
| Date-only | string YYYY-MM-DD | birthDate, dueDate |

- Backend ne formate JAMAIS les dates
- Toujours mettre a jour `updatedAt` sur chaque patch

## 10. Observabilite

### Logger structure
- Pas de `console.log` en production
- Pino recommande (ou logger minimal JSON)
- Chaque log inclut : `userId`, `correlationId`, metadonnees

### Correlation ID
1. Middleware : generer/propager `x-correlation-id`
2. Backend : inclure dans chaque log
3. Frontend : envoyer dans chaque requete fetch

### Error tracking
Sentry des le premier deploiement :
- Source maps a chaque deploy
- Breadcrumbs automatiques
- Alertes sur nouvelles erreurs

### Metriques RED
| Metrique | Alerte si |
|---|---|
| Rate | Chute brutale |
| Errors | > 1% sur 5 min |
| Duration | p95 > 2s |

## 11. Routes API Next.js

Reservees aux integrations externes (webhooks, OAuth). Pas de remplacement du backend.

| Categorie | Auth |
|---|---|
| Privee | Session obligatoire |
| Webhook | Verification de signature |
| Publique | Aucune (documenter) |

## 12. DRY backend

- 1 fichier = 1 domaine, max 250 LoC de logique
- 1 operation metier = 1 seul endpoint
- Helpers partages dans `helpers.ts` pour patterns repetes 3+ fois
- Contraintes d'unicite DB = filet de securite contre race conditions
