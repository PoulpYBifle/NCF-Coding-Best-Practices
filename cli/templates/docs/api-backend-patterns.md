# API & Backend — Patterns

## Template de mutation (ordre obligatoire)

```
1. AUTH         → Verifier l'identite et les permissions
2. VALIDATION   → Regles metier (limites, format)
3. VERIFICATION → Existence des entites referencees
4. OPERATION    → Insertion / modification
```

## Erreurs structurees — Codes standardises

| Code | Usage |
|---|---|
| `NOT_FOUND` | Entite inexistante |
| `UNAUTHORIZED` | Non authentifie |
| `FORBIDDEN` | Authentifie mais pas autorise |
| `VALIDATION` | Donnees invalides |
| `CONFLICT` | Duplication, unicite, version mismatch |
| `LIMIT_EXCEEDED` | Quota, taille max |
| `INTERNAL` | Erreur inattendue (log + message generique) |

**Regle** : Toujours `throw new AppError({ code, message })`, jamais `throw new Error("...")` generique.

## Pagination obligatoire

Toute query de liste doit definir une `limit` et un `sort`. Interdit de retourner une liste non bornee.

| Strategie | Quand | Avantage |
|---|---|---|
| Offset/Limit | Petites collections (< 10k), navigation par page | Simple |
| Cursor-based | Grandes collections, infinite scroll | Performant, pas de skip |

**Toujours borner** : `Math.min(limit, maxLimit)` cote serveur.

## Operations multi-etapes

1. Chaque etape critique a un etat intermediaire (`status: "creating"`)
2. Chaque etape qui peut echouer a une compensation (rollback)
3. Les etats intermediaires sont filtres des queries par defaut
4. Les effets de bord non-critiques (emails, webhooks) passent par un scheduler/queue

## Idempotence — Table de decision

| Mutation | Naturellement idempotente ? | Cle necessaire ? |
|---|---|---|
| `updateProject(id, { name })` | Oui | Non |
| `createProject({ name })` | Non (doublon) | Oui |
| `processPayment({ amount })` | Non (double facturation) | Oui |
| `deleteProject(id)` | Oui (no-op si deja supprime) | Non |
| `sendInviteEmail(email)` | Non (double email) | Oui |

**Frontend** : Generer la cle au montage (`useMemo(() => crypto.randomUUID(), [])`), pas au clic.

## Optimistic Locking

Quand plusieurs utilisateurs peuvent modifier la meme entite :
- Champ `version` (ou `updatedAt`) dans l'entite
- Verifier la version avant update, rejeter avec `CONFLICT` si mismatch
- Frontend : proposer de recharger la page en cas de conflit

## Contraintes DB = filet de securite

Les contraintes d'unicite en base protegent contre les race conditions meme si le code applicatif verifie les doublons. Toujours les definir.

## Routes API Next.js

Reservees aux **integrations externes** (webhooks, OAuth callbacks). Pas un remplacement du backend principal.

| Categorie | Auth |
|---|---|
| Privee | Session utilisateur obligatoire |
| Webhook | Verification de signature |
| Publique | Aucune (documenter explicitement) |

## DRY backend

- 1 fichier = 1 domaine metier, max 250 lignes de logique
- 1 operation metier = 1 seul endpoint (pas de duplication de mutation)
- Helpers partages dans `helpers.ts` pour les patterns repetes 3+ fois

> Ref: Constitution V5 §5, §11
